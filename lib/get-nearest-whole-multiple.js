module.exports = function getNearestWholeMultiple(input, x) {
  var output = Math.round(input / x)
  if (output === 0 && input < 0) output += 1
  return output * x
}
