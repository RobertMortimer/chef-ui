/* sets up file watchers for the app. The file watchers watch directories
  schema and uiSchema and updates app.locals.schemas object.
 */

const chokidar = require("chokidar");
const namer = require("../utils/name");
const fs = require("fs");
const path = require("path");
const schemaMap = {};

module.exports = app => {
  const schemaFiles = fs.readdirSync("./schemas");
  const uiFiles = fs.readdirSync("./uiSchemas");
  const schemas = {};

  // read all the files in the directories synchronously
  schemaFiles.forEach(file => {
    const fileName = namer.getFileName(file);
    let schemaName = null;
    try {
      const jsonObject = JSON.parse(fs.readFileSync("./schemas/" + file));
      // get schema name from object or default to name convention
      schemaName = jsonObject.hasOwnProperty('schema_name') ?
        jsonObject.schema_name : namer.fileToSchema(fileName);
      schemaMap[fileName] = schemaName; // add to schema map
      schemas[schemaName] = { schema: jsonObject, schema_name: schemaName }; // add to schemas
    } catch (e) {
      console.log(`Error Reading Schema File: ${file}\nDetails:`, e);
    }
    // check if UI files with the same name
    if (uiFiles.includes(file) && schemaName !== null) {
      try {
        schemas[schemaName].uiSchema = JSON.parse(
          fs.readFileSync("./uiSchemas/" + file)
        );
      } catch (e) {
        console.log(`Error Reading UI File: ${file}\nDetails:`, e);
      }
    }
  });

  // store in app state
  app.locals.schemas = schemas;

  const fileChange = dir => file => {
    console.log("File Changed:", file);
    const fileName = namer.getFileName(file);
    const name = schemaMap[fileName];
    try {
      const data = JSON.parse(fs.readFileSync(file));
      app.locals.schemas[name][dir] = data;
    } catch (e) {
      console.error("Error in Reading Changed File:", e);
    }
  };

  const fileAdded = dir => file => {
    console.log("File Added:", file);
    const fileName = namer.getFileName(file);
    let name;
    try {
      const data = JSON.parse(fs.readFileSync(file));
      if (schemaMap.hasOwnProperty(fileName)) {
        name = schemaMap[fileName];
      } else {
        name = data.hasOwnProperty('schema_name') ?
          data.schema_name : namer.fileToSchema(fileName);
      }
      if (app.locals.schemas.hasOwnProperty(name)) {
        app.locals.schemas[name][dir] = data;
      } else {
        app.locals.schemas[name] = { [dir]: data, schema_name: name };
      }
    } catch (e) {
      console.error("Error in Reading Added File:", e);
    }
  };

  const fileRemoved = dir => file => {
    console.log("File Removed:", file);
    const fileName = namer.getFileName(file);
    const name = schemaMap[fileName];
    delete app.locals.schemas[name][dir];
    if (Object.keys(app.locals.schemas[name]).length === 1) {
      delete app.locals.schemas[name];
      delete schemaMap[fileName];
    }
  };

  chokidar
    .watch("./schemas/", { persistent: true, awaitWriteFinish: true })
    .on("add", fileAdded("schema"))
    .on("change", fileChange("schema"))
    .on("unlink", fileRemoved("schema"))
    .on("error", e => console.error("File Watch Error", e));

  chokidar
    .watch("./uiSchemas/", { persistent: true, awaitWriteFinish: true })
    .on("add", fileAdded("uiSchema"))
    .on("change", fileChange("uiSchema"))
    .on("unlink", fileRemoved("uiSchema"))
    .on("error", e => console.error("File Watch Error", e));
};
