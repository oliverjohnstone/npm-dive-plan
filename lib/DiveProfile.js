var ZHL16 = require('npm-buhlmann-ZH-L16')
  , createSetPoint = require('./create-setpoint')
  , createSegment = require('./create-segment')
  , CNS = require('./o2-toxicity/cns')
  , PTD = require('./o2-toxicity/calculate-pulmonary-toxic-dose')
  , minDecoDepth = 3
  , decoIncrements = 3
  , find = require('lodash.find')
  , map = require('lodash.map')
  // TODO
  , BSAC88 = function () { }

module.exports = DivePlan

function DivePlan (algorithm) {
  if (!algorithm) {
    throw new Error('Please select a decompression algorithm')
  }

  this.setupDecoAlgorithm(algorithm)
}

DivePlan.prototype.normaliseTable = function (segments) {
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

DivePlan.prototype.calculateProfile = function (waypoints) {
  var table = []
    , currentDepth = 0
    , runTime = 0

  this.maxDepth = 0
  this.firstDecoDepth = 0

  this.deco.setActiveGas(waypoints[0].getGas())

  waypoints.forEach(function (waypoint) {
    var depth = waypoint.depth
      , decoFn = depth > currentDepth ? 'descend' : depth < currentDepth ? 'ascend' : 'constantDepth'

    currentDepth = this[decoFn](table, runTime, currentDepth, waypoint)
    runTime += waypoint.getDuration()
  }.bind(this))

  return this.normaliseTable(table)
}

// Return the correct gradient factor for the current depth
DivePlan.prototype.getGradientFactor = function (currentDepth) {
  var diff = this.gradientFactors.high - this.gradientFactors.low
    , pnts = diff / this.maxDepth

  return this.gradientFactors.low + ( pnts * currentDepth )
}

DivePlan.prototype.getDecoDepth = function (depth) {
  return depth < minDecoDepth ? minDecoDepth : depth
}

function getNearestWholeMultiple(input, x) {
  var output = Math.round(input / x)

  if (output === 0 && input < 0) output += 1

  return output * x
}

function findNextDecoStop(depth) {
  return getNearestWholeMultiple(depth, decoIncrements)
}

DivePlan.prototype.getDecoObligation = function (currentDepth) {
  var time = 0
    , endDepth = findNextDecoStop(currentDepth)
    , start = currentDepth

  // While we've not decompressed enough to reach the next depth
  while (endDepth < currentDepth) {
    time++
    this.deco.onGasForDepthTime(start, 1)
    currentDepth = this.deco.findAscentDepth(this.getGradientFactor(start))
  }

  return { time: time, depth: endDepth }
}

DivePlan.prototype.descend = function (table, runTime, currentDepth, waypoint) {
  var gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()
    , duration = waypoint.getDuration()
    , descentSpeed = (endDepth - currentDepth) / duration

  this.deco.changeDepth(currentDepth, endDepth, descentSpeed)

  if (endDepth > this.maxDepth) this.maxDepth = endDepth

  table.push(createSegment(currentDepth, endDepth, duration, gas))
  return endDepth
}

DivePlan.prototype.ascend = function (table, runTime, currentDepth, waypoint) {
  var minDepth = this.deco.findAscentDepth(this.getGradientFactor(currentDepth))
    , gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()
    , duration = waypoint.getDuration()
    , ascentSpeed = (currentDepth - endDepth) / duration

  if (minDepth <= endDepth) {
    // No deco for this waypoint
    this.deco.changeDepth(currentDepth, endDepth, ascentSpeed)
    table.push(createSegment(currentDepth, endDepth, duration, gas))
    return endDepth
  } else {
    // Decompression required
    return this.decompress(table, runTime, currentDepth, waypoint)
  }
}

DivePlan.prototype.ascendToDecoStop = function (table, runTime, currentDepth, waypoint) {
  var minDepth = this.deco.findAscentDepth(this.getGradientFactor(currentDepth))
    , decoDepth = this.getDecoDepth(minDepth)
    , duration = waypoint.getDuration()
    , ascentSpeed = (waypoint.getDepth() - currentDepth) / duration
    , gas = waypoint.getGas()

  if (decoDepth >= currentDepth) return decoDepth

  // Now ascend to the min/deco depth
  this.deco.changeDepth(currentDepth, decoDepth, ascentSpeed)
  table.push(createSegment(currentDepth, decoDepth, duration, gas))
}

DivePlan.prototype.decompress = function (table, runTime, currentDepth, waypoint) {
  var decoDepth
    , gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()

  // First ascend to the decompression depth
  this.ascendToDecoStop(table, runTime, currentDepth, waypoint)

  // Then do the decompression
  decoDepth = this.getDecoDepth(this.deco.findAscentDepth(this.getGradientFactor(currentDepth)))
  while (decoDepth > endDepth) {
    decoDepth = this.getDecoDepth(decoDepth)

    decoObligation = this.getDecoObligation(decoDepth)
    if (decoObligation.time > 0) {
      table.push(createSegment(decoObligation.depth, decoObligation.depth, decoObligation.time, gas, true))
    }

    if (decoDepth - minDecoDepth < 0.001) decoDepth = 0
    else decoDepth -= 0.5
  }
  return decoDepth
}

DivePlan.prototype.constantDepth = function (table, runTime, currentDepth, waypoint) {
  this.deco.onGasForDepthTime(waypoint.getDepth(), waypoint.getDuration())
  table.push(createSegment(waypoint.getDepth(), waypoint.getDepth(), waypoint.getDuration(), waypoint.getGas()))
  return waypoint.getDepth()
}

DivePlan.prototype.setGradientFactors = function (high, low) {
  this.gradientFactors = { high: high, low: low }
}

DivePlan.prototype.setupDecoAlgorithm = function (algorithm) {
  var Deco = null
  switch(algorithm) {
    case 'ZH-L16A': Deco = ZHL16.ZHL16A; break
    case 'ZH-L16B': Deco = ZHL16.ZHL16B; break
    case 'ZH-L17B': Deco = ZHL16.ZHL17B; break
    case 'BSAC88': Deco = BSAC88; break
    default: throw new Error('Please select a valid decompression algorithm')
  }
  this.deco = new Deco()
}

DivePlan.prototype.setCurrentTissueLoading = function () {
  // TODO
}
