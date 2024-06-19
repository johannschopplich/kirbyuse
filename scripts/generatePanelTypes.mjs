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

    // Ignore deprecated Vue properties
    if (level === 0 && (key.startsWith("$") || key === "app")) {
      continue;
    }

    const value = obj[key];
    const valueType = getTypeFromValue(value);
    const nestedInterfaceName = toPascalCase(`${interfaceName}_${key}`);
    let typeValue = generateTypeDefinition(value, valueType);

    if (
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
${level === 0 ? `import type { VueConstructor } from "vue";\n` : ""}
export interface ${interfaceName} {
${level === 0 ? `${indent}app: InstanceType<VueConstructor>;\n` : ""}${_interface}}
${_nestedInterfaces}`.trimStart();
}

function generateTypeDefinition(value, valueType) {
  if (valueType === "array") {
    return inferArrayType(value);
  } else if (valueType === "asyncfunction" || valueType === "function") {
    return inferFunctionType(value, valueType === "asyncfunction");
  } else if (valueType === "null" || valueType === "undefined") {
    return "any";
  } else if (valueType === "date") {
    return "Date";
  } else if (valueType === "regexp") {
    return "RegExp";
  } else {
    return valueType;
  }
}

function inferArrayType(array) {
  if (array.length === 0) {
    return "any[]";
  }

  const types = new Set();
  for (const item of array) {
    types.add(getTypeFromValue(item));
  }

  if (types.size === 1) {
    const type = [...types][0];
    return `${generateTypeDefinition(array[0], type)}[]`;
  }

  return `(${[...types].map((type, index) => generateTypeDefinition(array[index], type)).join(" | ")})[]`;
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
      ? parameters.map((_, index) => `arg${index + 1}: any`).join(", ")
      : "...args: any[]"
  }) => ${isAsync ? "Promise<any>" : "any"}`;
}

function getTypeFromValue(value) {
  return Object.prototype.toString
    .call(value)
    .replace(/^\[object\s+([a-z]+)\]$/i, "$1")
    .toLowerCase();
}

function sanitizeKey(key) {
  if (/^[a-z_$][\w$]*$/i.test(key)) {
    return key;
  } else {
    return `"${key.replace(/"/g, '\\"')}"`;
  }
}

function toPascalCase(value) {
  return value.replace(/(^\w|_\w)/g, (match) =>
    match.replace("_", "").toUpperCase(),
  );
}
