var cnsPO2Ranges = require('./cns-po2-ranges')
  , find = require('lodash.find')
  , each = require('lodash.foreach')
  , calculateExposureTime = require('./calculate-exposure-time')

module.exports =
  { getCNSForChangingDepth: getCNSForChangingDepth
  , getCNSForFixedDepth: getCNSForFixedDepth
  }

function getCNSForChangingDepth(start, end, rate, gas, ppo2) {
  if (end < start) rate *= -1

  var startPO2 = ppo2 || gas.getPPO2(start)
    , endPO2 = ppo2 || gas.getPPO2(end)
    , exposureTime = calculateExposureTime((end - start) / rate, startPO2, endPO2)
    , cns = 0
    , minPO2 = startPO2
    , maxPO2 = endPO2

  // If min & max are the wrong way round, swap them
  if (endPO2 < startPO2) {
    minPO2 = endPO2
    maxPO2 = startPO2
  }

  if (endPO2 < 0.5 && startPO2 < 0.5) return 0

  each(cnsPO2Ranges, function (range) {
    cns += calculateCNS(minPO2, maxPO2, rate, exposureTime, range)
  })

  return +(cns * 100).toFixed(2)
}

function getCNSForFixedDepth(depth, time, gas) {
  var po2 = gas.getPPO2(depth)
    , tlim

  // Unable to calculate CNS for this gas using PO2 range
  if (po2 > 1.6 || po2 < 0.5) return 0

  var range = find(cnsPO2Ranges, function (range) {
    return range.PO2Low < po2 && range.PO2High >= po2
  })

  tlim = range.slope * po2 + range.intercept

  return +((time / tlim) * 100).toFixed(2)
}

function calculateCNS(minPO2, maxPO2, rate, exposureTime, range) {
  var segTime = 0
    , po2 = 0
    , diff = 0
    , tlim = 0
    , mk = 0

  function getPO2(high, low) {
    return rate < 0 ? high : low
  }

  if (range.PO2High >= minPO2 & range.PO2Low < maxPO2) {
    if (range.PO2Low >= minPO2 & range.PO2High <= maxPO2) {
      diff = range.PO2High - PO2Low
      po2 = getPO2(range.PO2High, range.PO2Low)
    } else if (range.PO2Low >= minPO2 & range.PO2High > maxPO2) {
      diff = maxPO2 - range.PO2Low
      po2 = getPO2(maxPO2, range.PO2Low)
    } else if (range.PO2Low < minPO2 & range.PO2High <= maxPO2) {
      diff = range.PO2High - minPO2
      po2 = getPO2(rang.PO2High, minPO2)
    } else {
      diff = maxPO2 - minPO2
      po2 = getPO2(maxPO2, minPO2)
    }

    segTime = exposureTime * (diff / (maxPO2 - minPO2))
  }

  if (segTime <= 0) return 0

  tlim = range.slope * po2 + range.intercept
  mk = range.slope * (diff / segTime)

  return (1.0 / mk) * (Math.log(Math.abs(tlim + mk * segTime)) - Math.log(Math.abs(tlim)))
}
