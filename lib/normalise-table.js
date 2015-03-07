var find = require('lodash.find')
  , map = require('lodash.map')

module.exports = function normaliseTable(segments) {
  var newDepths = []

  segments.forEach(function (segment, i) {
    if (segment.deco) {
      var decoSeg = find(newDepths, function (newSeg) {
        return newSeg.segment.deco && newSeg.segment.endDepth === segment.endDepth
      })

      if (decoSeg) decoSeg.segment.duration += segment.duration
      else newDepths.push({ index: i, segment: segment })
    } else {
      newDepths.push({ index: i, segment: segment })
    }
  })

  return map(newDepths, function (segment) { return segment.segment })
}
