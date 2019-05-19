const readName = path => {
  return path
    .split("/")
    .slice(-1)[0]
    .replace(".json", "")
    .split("_")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const importAll = r => {
  const keys = r.keys().map(k => readName(k));
  const values = r.keys().map(r);
  let samples = {};
  keys.forEach((k, i) => {
    samples[k] = values[i];
  });
  return samples;
};

export const processSchemas = () => {
  const schemas = importAll(require.context("../schemas", false, /\.(json)$/));
  const uiSchemas = importAll(
    require.context("../uiSchemas", false, /\.(json)$/)
  );
  const samples = {};
  Object.entries(schemas).forEach(([k, schema]) => {
    let key;
    if (schema.hasOwnProperty("schema_name")) {
      key = schema.schema_name;
    } else {
      key = k;
      schema.schema_name = k;
    }

    samples[key] = { schema };
    if (uiSchemas.hasOwnProperty(k)) {
      samples[key].uiSchema = uiSchemas[k];
    }
  });
  return samples;
};

export const getInitialFormData = schema => {
  if (schema) {
    if (!schema.hasOwnProperty("type")) {
      return ""
    }

    switch (schema.type.toLowerCase()) {
      case "object":
        let obj = {};
        Object.entries(schema.properties).forEach(([k, v]) => {
          obj[k] = getInitialFormData(v);
        });
        return obj;
      case "string":
        if (schema.format && schema.format === 'data-url') {
          return undefined;
        }
        return "";
      case "number":
        return undefined;
      case "integer":
        return undefined;
      case "boolean":
        return null;
      case "array":
        return [];
    }
  } else {
    return {}
  }
};
