String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] == "undefined" ? match : args[index];
  });
};
