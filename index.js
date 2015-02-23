var ZHL16 = require('npm-buhlmann-ZH-L16')
  , createSetPoint = require('./lib/create-setpoint')
  // TODO
  , BSAC88 = function () { }

module.exports = DivePlan

function DivePlan (algorithm) {
  if (!algorithm) {
    throw new Error('Please select a decompression algorithm')
  }

  this.decoDepth = 0

  this.setupDecoAlgorithm(algorithm)
}

DivePlan.prototype.calculateProfile = function (waypoints) {
  var table = []
    , currentDepth = 0
    , totalRunTime = 0


}

DivePlan.prototype.setGradientFactors = function (high, low) {
  this.gradientFactors = { high: high, low: low }
}

DivePlan.prototype.setEquipment = function (equipment) {
  var validEquipmentTypes = [ 'CCR', 'SCR', 'OC' ]
  if (validEquipmentTypes.indexOf(equipment) === -1) {
    throw new Error('Invalid equipment type selected')
  }
  this.equipmentType = equipment
}

function throwIfSetpointDangerous(point) {
  if (point < 0.2) throw new Error('Set point is too low')
  if (point > 1.6) throw new Error('Set point is too high')
}

DivePlan.prototype.setLowSetPoint = function (setpoint, switchDepth) {
  throwIfSetpointDangerous(setpoint)
  this.lowSetPoint = createSetPoint(setpoint, switchDepth)
}

DivePlan.prototype.setHighSetPoint = function (setpoint, switchDepth) {
  throwIfSetpointDangerous(setpoint)
  this.highSetPoint = createSetPoint(setpoint, switchDepth)
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
