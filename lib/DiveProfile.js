var ZHL16 = require('npm-buhlmann-ZH-L16')
  , createSetPoint = require('./create-setpoint')
  , createSegment = require('./create-segment')
  , cns = require('./o2-toxicity/cns')
  , ptd = require('./calculate-pulmonary-toxic-dose')
  , minDecoDepth = 3
  // TODO
  , BSAC88 = function () { }

module.exports = DivePlan

function DivePlan (algorithm) {
  if (!algorithm) {
    throw new Error('Please select a decompression algorithm')
  }

  this.setupDecoAlgorithm(algorithm)
}

DivePlan.prototype.calculateProfile = function (waypoints) {
  var table = []
    , currentDepth = 0
    , runTime = 0

  this.firstDecoDepth = 0

  this.deco.setActiveGas(waypoints[0].getGas())

  waypoints.forEach(function (waypoint) {
    var depth = waypoint.depth
      , decoFn = depth > currentDepth ? descend : depth < currentDepth ? ascend : constantDepth

    this[decoFn](table, runTime, currentDepth, waypoint)
    runTime += waypoint.getDuration()
  })
}

// Return the correct gradient factor for the current depth
DivePlan.prototype.getGradientFactor = function (currentDepth) {
  // TODO
  return this.gradientFactors.low
}

DivePlan.prototype.getDecoDepth = function (depth) {
  return depth < minDecoDepth ? minDecoDepth : depth
}

DivePlan.prototype.descend = function (table, runTime, currentDepth, waypoint) {
  var gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()
    , duration = waypoint.getDuration()
    , descentSpeed = (endDepth - currentDepth) / duration
    , cns = cns.getCNSForChangingDepth(currentDepth, endDepth, descentSpeed, gas)
    , cptd = pdt.getCPTDForChangingDepth(gas, currentDepth, endDepth, descentSpeed)

  this.deco.changeDepth(currentDepth, endDepth, descentSpeed)

  // TODO - Halfway depth for cns and cptd

  table.push(createSegment(endDepth, duration, runTime, gas, cns, cptd))
}

DivePlan.prototype.ascend = function (table, runTime, currentDepth, waypoint) {
  var minDepth = this.deco.findAscentDepth(this.getGradientFactor(currentDepth))
    , gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()
    , duration = waypoint.getDuration()
    , ascentSpeed = (endDepth - currentDepth) / duration
    , cns
    , cptd

  if (minDepth <= endDepth) {
    // No deco for this waypoint
    this.deco.changeDepth(currentDepth, endDepth, ascentSpeed)
    cns = cns.getCNSForChangingDepth(currentDepth, endDepth, ascentSpeed, gas)
    cptd = pdt.getCPTDForChangingDepth(gas, currentDepth, endDepth, ascentSpeed)
    table.push(createSegment(endDepth, duration, runTime, gas, cns, cptd))
  } else {
    // Decompression required
    this.decompress(table, runTime, currentDepth, waypoint)
  }
}

DivePlan.prototype.ascendToDecoStop = function (table, runTime, currentDepth, waypoint) {
  var minDepth = this.deco.findAscentDepth(this.getGradientFactor(currentDepth))
    , decoDepth = this.getDecoDepth(minDepth)
    , duration = waypoint.getDuration()
    , ascentSpeed = (waypoint.endDepth - currentDepth) / duration
    , gas = waypoint.getGas()
    , cns
    , cptd

  if (decoDepth >= currentDepth) return decoDepth

  // Now ascend to the min/deco depth
  this.deco.changeDepth(currentDepth, decoDepth, ascentSpeed)
  cns = cns.getCNSForChangingDepth(currentDepth, decoDepth, ascentSpeed, gas)
  cptd = pdt.getCPTDForChangingDepth(gas, currentDepth, decoDepth, ascentSpeed)
  table.push(createSegment(decoDepth, duration, runTime, gas, cns, cptd))
}

DivePlan.prototype.decompress = function (table, runTime, currentDepth, waypoint) {
  var decoDepth
    , gas = waypoint.getGas()
    , endDepth = waypoint.getDepth()
    , cns = 0
    , cptd = 0
    , decoTime = 0

  // First ascend to the decompression depth
  this.ascendToDecoStop(table, runTime, currentDepth, waypoint)

  // Then do the decompression
  decoDepth = this.getDecoDepth(this.deco.findAscentDepth(this.getGradientFactor(currentDepth)))
  while (decoDepth > endDepth) {
    decoDepth = this.getDecoDepth(decoDepth)

    decoTime = this.getDecoTime(decoDepth, this.getGradientFactor(decoDepth))
    cns = cns.getCNSForFixedDepth(decoDepth, decoTime, gas)
    cptd = ptd.getCPTDForFixedDepth(gas, decoDepth, decoTime)

    table.push(createSegment(decoDepth, decoTime, runTime, gas, cns, cptd))

    if (decoDepth - minDecoDepth < 0.001) decoDepth = 0
    else decoDepth -= 0.5
  }
}

DivePlan.prototype.constantDepth = function (table, runTime, currentDepth, waypoint) {
  var cns = cns.getCNSForFixedDepth(waypoint.getDepth(), waypoint.getDuration(), waypoint.getGas())
    , cptd = ptd.getCPTDForFixedDepth(waypoint.getGas(), waypoint.getDepth(), waypoint.getDuration())

  this.deco.onGasForDepthTime(waypoint.getDepth(), waypoint.getDuration())
  table.push(createSegment(waypoint.getDepth(), waypoint.getDuration(), runTime, waypoint.getGas(), cns, cptd))
}

DivePlan.prototype.setGradientFactors = function (high, low) {
  this.gradientFactors = { high: high, low: low }
}

// DivePlan.prototype.setEquipment = function (equipment) {
//   var validEquipmentTypes = [ 'CCR', 'SCR', 'OC' ]
//   if (validEquipmentTypes.indexOf(equipment) === -1) {
//     throw new Error('Invalid equipment type selected')
//   }
//   this.equipmentType = equipment
// }

// function throwIfSetpointDangerous(point) {
//   if (point < 0.2) throw new Error('Set point is too low')
//   if (point > 1.6) throw new Error('Set point is too high')
// }

// DivePlan.prototype.setLowSetPoint = function (setpoint, switchDepth) {
//   throwIfSetpointDangerous(setpoint)
//   this.lowSetPoint = createSetPoint(setpoint, switchDepth)
// }

// DivePlan.prototype.setHighSetPoint = function (setpoint, switchDepth) {
//   throwIfSetpointDangerous(setpoint)
//   this.highSetPoint = createSetPoint(setpoint, switchDepth)
// }

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
