var calculateExposureTime = require('./calculate-exposure-time')
  , mswToFsw = function (msw) { return msw * 3.2808399 }

module.exports =
  { getCPTDForFixedDepth: getCPTDForFixedDepth
  , getCPTDForChangingDepth: getCPTDForChangingDepth
  }

function round(number) {
  return +number.toFixed(2)
}

function getCPTDForFixedDepth(gas, depth, duration) {
  var po2 = gas.getPPO2(depth)

  if (po2 < 0.5) return 0

  var base = 0.5 / (po2 - 0.5)
    , exponent = -5.0 / 6

  return round(Math.abs(duration) * Math.pow(base, exponent))
}

function getCPTDForChangingDepth(gas, start, end, rate, po2) {
  if (end < start) rate *= -1

  var startPO2 = po2 || gas.getPPO2(start)
    , endPO2 = po2 || gas.getPPO2(end)
    , multiplier
    , initialPO2Part
    , endPO2Part
    , exponent = 11 / 6
    , exposureTime = calculateExposureTime((mswToFsw(end) - mswToFsw(start)) / mswToFsw(rate), startPO2, endPO2)

  if (exposureTime === 0) return 0;

  if (startPO2 === endPO2) {
    // Assume we're using a rebreather so can return a constant depth calculation instead
    return getCPTDForFixedDepth(gas, end, (end - start) / rate)
  }

  multiplier = ((( 3 / 11 ) * exposureTime) / (endPO2 - startPO2))
  initialPO2Part = Math.pow((startPO2 - 0.5) / 0.5, exponent)
  endPO2Part = Math.pow((endPO2 - 0.5 ) / 0.5, exponent)

  return round(multiplier * (endPO2Part - initialPO2Part))

}
