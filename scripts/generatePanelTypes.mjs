const observedObjects = new WeakSet();

if (typeof window !== "undefined" && window.panel) {
  const tsInterface = generateTypeScriptInterface(window.panel, "Panel");
  console.log(
    `
import type { VueConstructor, ComponentPublicInstance } from "vue";

${tsInterface}`.trimStart(),
  );
}

function generateTypeScriptInterface(obj, interfaceName = "Root", level = 0) {
  const indent = "  ";

  if (observedObjects.has(obj)) {
    return `${indent}// Circular reference detected\n`;
  }

  observedObjects.add(obj);

  // Return early for empty objects
  if (Object.keys(obj).length === 0) {
    return `export type ${interfaceName} = Record<string, any>;`;
  }

  let _interface = "";
  let _nestedInterfaces = "";

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Ignore deprecated Panel aliases
    if (level === 0 && key.startsWith("$")) {
      continue;
    }

    const value = obj[key];
    const valueType = inferValueType(value);
    const nestedInterfaceName = toPascalCase(`${interfaceName}_${key}`);
    let typeValue = generateTypeDefinition(valueType, value);

    // Handle top-level definitions
    if (level === 0 && key === "app") {
      // Use correct Vue type and generate only the store types
      typeValue = "InstanceType<VueConstructor> & { $store: PanelAppStore }";
      _nestedInterfaces += generateTypeScriptInterface(
        {
          // Use plain object for state
          state: {},
          // Extract getters from the store
          getters: value.$store.getters,
        },
        `${interfaceName}AppStore`,
        level + 1,
      );
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
    else if (nestedInterfaceName === "PanelPluginsComponents") {
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
    else if (nestedInterfaceName === "PanelViewPropsModelContent") {
      typeValue = "Record<string, any>";
    }
    // Simplify interfaces for string-based enums
    else if (
      nestedInterfaceName === "PanelTranslationData" ||
      nestedInterfaceName === "PanelSystemAscii"
    ) {
      typeValue = "Record<string, string>";
    } else if (valueType === "object") {
      typeValue = nestedInterfaceName;
      _nestedInterfaces += generateTypeScriptInterface(
        value,
        nestedInterfaceName,
        level + 1,
      );
    }

    _interface += `${indent}${sanitizeKey(key)}${valueType === "undefined" ? "?" : ""}: ${typeValue};\n`;
  }

  return `
export interface ${interfaceName} {
${_interface}}
${_nestedInterfaces}`.trimStart();
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
