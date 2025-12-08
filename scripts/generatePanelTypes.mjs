const CODE_INDENT = "  ";
let observedObjects = new WeakSet();

if (typeof window !== "undefined" && window.panel) {
  observedObjects = new WeakSet();
  const panelInterface = generateTypeScriptInterface(
    {
      ...window.panel,
      // Removed after Panel initialization, but added again for type generation
      plugin: () => {},
    },
    "Panel",
    {
      typeResolver: panelTypeResolver,
    },
  );

  observedObjects = new WeakSet();
  const libraryInterface = generateTypeScriptInterface(
    window.panel.app.$library,
    "PanelLibrary",
    {
      typeResolver: panelTypeResolver,
    },
  );

  console.log(
    `
import type { ComponentPublicInstance, VueConstructor } from "vue";

export type PanelApp = InstanceType<VueConstructor> & {
  $library: PanelLibrary;
};

${panelInterface.trim()}
${libraryInterface.trim()}
`.trim(),
  );
}

function panelTypeResolver(
  key,
  value,
  { level, interfaceName, currentKeyInterfaceName },
) {
  let typeValue;
  let generatedInterfaces;

  // Handle top-level definitions
  if (level === 0 && key === "app") {
    typeValue = "PanelApp";
  } else if (level === 0 && key === "languages") {
    typeValue = `
{
  code: string;
  default: boolean;
  direction: string;
  name: string;
  rules: Record<string, string>;
}[]`.trimStart();
  }
  // Handle Panel components
  else if (currentKeyInterfaceName === "PanelPluginsComponents") {
    typeValue = "Record<string, ComponentPublicInstance>";
  }
  // Overwrite view props, since they are specific to each view
  else if (
    (interfaceName === "PanelViewProps" && key === "tabs") ||
    (interfaceName === "PanelViewPropsTab" && key === "columns")
  ) {
    typeValue = "Record<string, any>[]";
  }
  // Overwrite model content, since it's a dynamic object
  else if (
    currentKeyInterfaceName === "PanelPluginsTextareaButtons" ||
    currentKeyInterfaceName === "PanelPluginsWriterMarks" ||
    currentKeyInterfaceName === "PanelViewPropsVersionsLatest" ||
    currentKeyInterfaceName === "PanelViewPropsVersionsChanges"
  ) {
    typeValue = "Record<string, any>";
  }
  // Simplify interfaces for string-based enums
  else if (
    currentKeyInterfaceName === "PanelLanguageRules" ||
    currentKeyInterfaceName === "PanelTranslationData" ||
    currentKeyInterfaceName === "PanelPluginsIcons" ||
    currentKeyInterfaceName === "PanelSystemLocales" ||
    currentKeyInterfaceName === "PanelSystemSlugs" ||
    currentKeyInterfaceName === "PanelSystemAscii"
  ) {
    typeValue = "Record<string, string>";
  }

  return { typeValue, generatedInterfaces };
}

function generateTypeScriptInterface(
  obj,
  interfaceName = "Root",
  { level = 0, typeResolver = () => ({}) } = {},
) {
  if (observedObjects.has(obj)) {
    return `// Circular reference detected\n`;
  }

  observedObjects.add(obj);

  // Return early for empty objects
  if (Object.keys(obj).length === 0) {
    return `export type ${interfaceName} = Record<string, any>;`;
  }

  let interfaceBody = "";
  let generatedInterfaces = "";

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Ignore deprecated Panel aliases only for the main Panel interface
    if (interfaceName === "Panel" && level === 0 && key.startsWith("$")) {
      continue;
    }

    const value = obj[key];
    const valueType = inferValueType(value);
    const currentKeyInterfaceName = toPascalCase(`${interfaceName}_${key}`);
    let typeValue = generateTypeDefinition(valueType, value);

    const {
      typeValue: customTypeValue,
      generatedInterfaces: customGeneratedInterfaces,
    } = typeResolver(key, value, {
      level,
      interfaceName,
      currentKeyInterfaceName,
    });

    if (customGeneratedInterfaces) {
      generatedInterfaces += customGeneratedInterfaces;
    }

    if (customTypeValue) {
      typeValue = customTypeValue;
    } else if (valueType === "object") {
      typeValue = currentKeyInterfaceName;
      generatedInterfaces += generateTypeScriptInterface(
        value,
        currentKeyInterfaceName,
        { level: level + 1, typeResolver },
      );
    }

    interfaceBody += `${CODE_INDENT}${sanitizeKey(key)}${valueType === "undefined" ? "?" : ""}: ${typeValue};\n`;
  }

  return `
export interface ${interfaceName} {
${interfaceBody}}
${generatedInterfaces}`.trimStart();
}

function generateTypeDefinition(valueType, value) {
  if (valueType === "object") {
    return inferObjectType(value);
  } else if (valueType === "array") {
    return inferArrayType(value);
  } else if (valueType === "asyncfunction" || valueType === "function") {
    return inferFunctionType(value, valueType === "asyncfunction");
  } else if (valueType === "date") {
    return "Date";
  } else if (valueType === "regexp") {
    return "RegExp";
  } else if (valueType === "map") {
    return "Map<any, any>";
  } else if (valueType === "set") {
    return "Set<any>";
  } else if (valueType === "weakmap") {
    return "WeakMap<object, any>";
  } else if (valueType === "weakset") {
    return "WeakSet<object>";
  } else if (valueType === "promise") {
    return "Promise<any>";
  } else if (valueType === "symbol") {
    return "symbol";
  } else if (valueType === "bigint") {
    return "bigint";
  } else if (valueType === "arraybuffer") {
    return "ArrayBuffer";
  } else if (valueType === "dataview") {
    return "DataView";
  } else if (valueType.includes("array")) {
    // Handle typed arrays
    return valueType.charAt(0).toUpperCase() + valueType.slice(1);
  } else if (
    valueType === "boolean" ||
    valueType === "number" ||
    valueType === "string"
  ) {
    return valueType;
  } else {
    return "any";
  }
}

function inferObjectType(obj) {
  // Enhanced Vue component detection
  if (obj._isVue || obj.__vue__ || obj.$el || obj.$options) {
    return "ComponentPublicInstance";
  }

  // Check for DOM elements
  if (obj.nodeType && obj.nodeName) {
    return "HTMLElement";
  }

  // Check for event objects
  if (obj.type && obj.target && obj.preventDefault) {
    return "Event";
  }

  // Check for error objects
  if (obj instanceof Error) {
    return "Error";
  }

  // Check for URL objects
  if (obj instanceof URL) {
    return "URL";
  }

  // Check for FormData
  if (obj instanceof FormData) {
    return "FormData";
  }

  // Check for class instances with constructors
  if (obj.constructor && obj.constructor.name !== "Object") {
    const constructorName = obj.constructor.name;
    if (constructorName && constructorName !== "Object") {
      return constructorName;
    }
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return "Record<string, any>";
  }

  const types = new Set();
  for (const key of keys) {
    types.add(inferValueType(obj[key]));
  }

  if (types.size === 1) {
    const type = [...types][0];
    return `{ ${keys.map((key) => `${sanitizeKey(key)}: ${generateTypeDefinition(type, obj[key])}`).join(", ")} }`;
  }

  return `{ ${Object.entries(obj)
    .map(
      ([key, value]) =>
        `${sanitizeKey(key)}: ${generateTypeDefinition(inferValueType(value), value)}`,
    )
    .join(", ")} }`;
}

function inferArrayType(array) {
  if (array.length === 0) {
    return "any[]";
  }

  const types = new Set();
  for (const item of array) {
    types.add(inferValueType(item));
  }

  if (types.size === 1) {
    const type = [...types][0];
    return `${generateTypeDefinition(type, array[0])}[]`;
  }

  return `(${[...types].map((type, index) => generateTypeDefinition(type, array[index])).join(" | ")})[]`;
}

function inferFunctionType(fn, isAsync) {
  const match = fn.toString().match(/\(([^)]*)\)/);

  if (!match) {
    return `() => ${isAsync ? "Promise<any>" : "any"}`;
  }

  const parameters = match[1]
    .trim()
    .split(",")
    .map((param) => param.trim())
    .filter(Boolean);

  return `(${
    parameters.length > 0 && !parameters.includes("...")
      ? parameters.map((_, index) => `arg${index + 1}?: any`).join(", ")
      : "...args: any[]"
  }) => ${isAsync ? "Promise<any>" : "any"}`;
}

function inferValueType(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function sanitizeKey(key) {
  if (/^[a-z_$][\w$]*$/i.test(key)) {
    return key;
  } else {
    return `"${key.replace(/"/g, '\\"')}"`;
  }
}

function toPascalCase(value) {
  return value
    .split(/[^a-z0-9]/i)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
