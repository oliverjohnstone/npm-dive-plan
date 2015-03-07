var CNS = require('./cns')
  , PTD = require('./calculate-pulmonary-toxic-dose')

module.exports = function calculateTissueLoading(segments) {
  segments.forEach(function (segment) {
    var start = segment.startDepth
      , end = segment.endDepth
      , gas = segment.gas
      , duration = segment.duration
      , rate = (end - start) / duration

    if (segment.startDepth !== segment.endDepth) {
      // Changing depth
      segment.cns = CNS.getCNSForChangingDepth(start, end, rate, gas)
      segment.cptd = PTD.getCPTDForChangingDepth(gas, start, end, rate)
    } else {
      // Fixed depth
      segment.cns = CNS.getCNSForFixedDepth(end, duration, gas)
      segment.cptd = PTD.getCPTDForFixedDepth(gas, end, duration)
    }
  })
  return segments
}
