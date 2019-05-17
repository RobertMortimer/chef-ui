// reading name from file
exports.readName = path =>
  path
    .split(".")[0]
    .split("_")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

// writing name from file
exports.writeName = name =>
  name
    .split(" ")
    .join("_")
    .toLowerCase() + ".json";
