module.exports = function(str) {
  if (typeof str === "undefined") {
    str = "World";
  }
  return `Hello ${str}`;
};
