module.exports.getInt = function getInt(request, field, valueIfMissing, valueIfNaN) {
  var value = request.query[field];

  if (value === undefined) {
    return valueIfMissing;
  }

  if (typeof value === "number" && isNaN(value)) {
    return value;
  }

  if (isNaN(value) || isNaN(parseInt(value))) {
    return valueIfNaN;
  }

  return parseInt(value);
};

