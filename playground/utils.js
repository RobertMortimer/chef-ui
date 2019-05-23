const namer = require('../src/server/utils/name');
const readName = file => namer.fileToSchema(namer.getFileName(file));

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
    }

    samples[key] = { schema, schema_name: key };
    if (uiSchemas.hasOwnProperty(k)) {
      samples[key].uiSchema = uiSchemas[k];
    }
  });
  return samples;
};

export const getDefaultFormData = (schema) => {
  if (schema.type.toLowerCase === 'object') return {};
}

export const getInitialFormData = (schema) => {
  if (schema) {
    if (!schema.hasOwnProperty("type")) {
      return undefined
    }
    if (Array.isArray(schema.type)) return undefined;
    else {
      switch (schema.type.toLowerCase()) {
        case "object":
          let obj = {};
          Object.entries(schema.properties).forEach(([k, v]) => {
            obj[k] = getInitialFormData(v);
          });
          return obj;
        case "array":
          if (schema.hasOwnProperty('default')
            || schema.hasOwnProperty('minList')
          ) {
            return [];
          }
          return undefined;
        default:
          if (schema.hasOwnProperty('default')) {
            return null;
          }
          return undefined;
      }
    }
  } else {
    return undefined
  }
};
