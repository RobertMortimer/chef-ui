const path = require('path');

// retrieves the file name from a path
exports.getFileName = dir => {
  const paths = dir.split(path.sep);
  const fileName = paths.length > 1 ? paths[paths.length - 1] : paths[0];
  return fileName;
}

// converts file name to Schema Name, with
// _ turned to spaces and first letter of every word capitalized
exports.fileToSchema = fileName => {
  let sepExt = fileName.split('.');
  sepExt = sepExt.length > 1 ? sepExt.slice(0, sepExt.length - 1): sepExt[0];
  sepExt = sepExt.join('.');
  return sepExt
    .split("_")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}


// converts Schema name to file name
// spaces are converted to _ and lowercased
exports.schemaToFile = name =>
  name
    .split(" ")
    .join("_")
    .toLowerCase() + ".json";
