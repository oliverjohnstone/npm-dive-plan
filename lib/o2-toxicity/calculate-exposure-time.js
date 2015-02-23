module.exports = function calculateExposureTime(duration, startO2, endO2) {
  var minO2
    , maxO2
    , lowO2

  if (startO2 > endO2) {
    minO2 = endO2
    maxO2 = startO2
  } else {
    minO2 = startO2
    maxO2 = endO2
  }

  lowO2 = minO2 < 0.5 ? 0.5 : minO2

  if (maxO2 <= 0.5) return 0

  return duration * ((maxO2 - lowO2) / (maxO2 - minO2))
}
