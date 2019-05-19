/* sets up file watchers for the app. The file watchers watch directories
  schema and uiSchema and updates app.locals.schemas object.
 */

const chokidar = require("chokidar");
const namer = require("../utils/name");
const fs = require("fs");
const path = require("path");

module.exports = app => {
  const schemaFiles = fs.readdirSync("./schemas");
  const uiFiles = fs.readdirSync("./uiSchemas");
  const schemas = {};

  // read all the files in the directories synchronously
  schemaFiles.forEach(file => {
    const name = namer.readName(file);
    schemas[name] = {
      schema: JSON.parse(fs.readFileSync("./schemas/" + file))
    };
    if (uiFiles.includes(file)) {
      schemas[name].uiSchema = JSON.parse(
        fs.readFileSync("./uiSchemas/" + file)
      );
    }
  });

  app.locals.schemas = schemas;

  const fileChange = dir => path => {
    console.log("File Changed:", path);
    const name = namer.readName(path.split("\\")[1]);
    try {
      const data = JSON.parse(fs.readFileSync(path));
      app.locals.schemas[name][dir] = data;
    } catch (e) {
      console.error("Error in Reading Changed File:", e);
    }
  };

  const fileAdded = dir => file => {
    console.log("File Added:", file);
    const name = namer.readName(file.split(path.sep)[1]);
    try {
      const data = JSON.parse(fs.readFileSync(file));
      if (app.locals.schemas.hasOwnProperty(name)) {
        app.locals.schemas[name][dir] = data;
      } else {
        app.locals.schemas[name] = { [dir]: data };
      }
    } catch (e) {
      console.error("Error in Reading Added File:", e);
    }
  };

  const fileRemoved = dir => file => {
    console.log("File Removed:", file);
    const name = namer.readName(file.split(path.sep)[1]);
    delete app.locals.schemas[name][dir];
    if (!Object.keys(app.locals.schemas[name]).length) {
      delete app.locals.schemas[name];
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
