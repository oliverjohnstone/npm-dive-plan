module.exports =
  { getCPTDForFixedDepth: getCPTDForFixedDepth
  , getCPTDForChangingDepth: getCPTDForChangingDepth
  }

function round(number) {
  return +Math.toFixed(number, 2)
}

// Depth should be expressed in fsw
function getCPTDForFixedDepth(gas, depth, duration, po2) {
  if (!po2) po2 = gas.getPPO2(depth)
  if (po2 < 0.5) return 0

  var base = 0.5 / (po2 - 0.5)
    , exponent = -5.0 / 6

  return round(duration * Math.pow(base, exponent))
}

// Depth should be expressed in fsw
function getCPTDForChangingDepth(gas, start, end, rate, po2) {
  if (end < start) rate = rate * -1

  var duration = (end - start) / rate
    , startPO2 = po2 || gas.getPPO2(start)
    , endPO2 = po2 || gas.getPPO2(end)
    , multiplier
    , initialPO2Part
    , endPO2Part
    , exponent = 11.0 / 6.0
    , exposureTime = calculateExposureTime((end - start) / rate, startPO2, endPO2)

  if (exposureTime === 0) return 0;

  multiplier = ((( 3.0 / 11.0 ) * exposureTime) / (endPO2 - startPO2))
  initialPO2Part = Math.Pow((po2Start - 0.5) / 0.5, exponent)
  endPO2Part = Math.Pow((po2End - 0.5 ) / 0.5, exponent)

  return round(multiplier * (endPO2Part - initialPO2Part))
}

function calculateExposureTime(duration, startO2, endO2) {
  var minO2
    , maxO2
    , lowO2 = minO2 < 0.5 ? 0.5 : minO2

  if (startO2 > endO2) {
    minO2 = endO2
    maxO2 = startO2
  } else {
    minO2 = startO2
    maxO2 = endO2
  }

  if (maxO2 <= 0.5) return 0

  return duration * ((maxO2 - lowO2) / (maxO2 - minO2))
}
