const SKIPPED_PANEL_INTERFACES = [
  // Panel plugin components
  "PanelPluginsComponents",
  // Model content
  "PanelViewPropsModelContent",
];

const observedObjects = new WeakSet();

if (typeof window !== "undefined" && window.panel) {
  const tsInterface = generateTypeScriptInterface(window.panel, "Panel");
  console.log(tsInterface);
}

function generateTypeScriptInterface(obj, interfaceName = "Root", level = 0) {
  const indent = "  ";

  if (observedObjects.has(obj)) {
    return `${indent}// Circular reference detected\n`;
  }

  observedObjects.add(obj);

  let _interface = "";
  let _nestedInterfaces = "";

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Ignore deprecated aliases
    if (level === 0 && key.startsWith("$")) {
      continue;
    }

    let value = obj[key];
    const valueType = inferValueType(value);
    const nestedInterfaceName = toPascalCase(`${interfaceName}_${key}`);
    let typeValue = generateTypeDefinition(valueType, value);

    // Skip parsing some values that contain specific data
    if (SKIPPED_PANEL_INTERFACES.includes(nestedInterfaceName)) {
      value = {};
    }

    // Handle the Vue app instance separately
    if (level === 0 && key === "app") {
      typeValue = 'InstanceType<(typeof import("vue"))["default"]>';
    }
    // Simplify interfaces for string-based enums
    else if (
      nestedInterfaceName === "PanelTranslationData" ||
      nestedInterfaceName === "PanelSystemAscii"
    ) {
      typeValue = nestedInterfaceName;
      _nestedInterfaces += `export interface ${nestedInterfaceName} {
${indent}[key: string]: string;
}\n`;
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
    return "Record<string, any>";
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
  const parameters = match?.[1]
    ?.trim()
    ?.split(",")
    ?.map((param) => param.trim())
    ?.filter(Boolean);

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
