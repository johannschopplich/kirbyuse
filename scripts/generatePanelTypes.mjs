const CODE_INDENT = "  ";
const observedObjects = new WeakSet();

if (typeof window !== "undefined" && window.panel) {
  const tsInterface = generateTypeScriptInterface(
    {
      ...window.panel,
      // Removed after Panel initialization, but added again for type generation
      plugin: () => {},
    },
    "Panel",
    {
      typeResolver: (
        key,
        value,
        { level, interfaceName, currentKeyInterfaceName },
      ) => {
        let typeValue;
        let generatedInterfaces;

        // Handle top-level definitions
        if (level === 0 && key === "app") {
          // Use correct Vue type and generate only the store types
          typeValue = "InstanceType<VueConstructor>";
          // Make language rules generic by overwriting the type
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
      },
    },
  );

  console.log(
    `
import type { ComponentPublicInstance, VueConstructor } from "vue";

${tsInterface}`.trimStart(),
  );
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

    // Ignore deprecated Panel aliases
    if (level === 0 && key.startsWith("$")) {
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
  // Skip Vue components
  if (obj._isVue) {
    return "ComponentPublicInstance";
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
