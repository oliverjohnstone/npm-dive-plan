var Plan = require('../DiveProfile')
  , assert = require('assert')
  , Gas = require('npm-buhlmann-ZH-L16').Gas
  , WayPoint = require('../WayPoint')

describe('DivePlan', function () {
  it('should export a function', function () {
    assert(typeof Plan === 'function')
  })

  it('should have a setCurrentTissueLoading function', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.setCurrentTissueLoading === 'function')
  })

  it('should have a setupDecoAlgorithm function', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.setupDecoAlgorithm === 'function')
  })

  it('should thrown an exception when an invalid algorithm has been selected', function () {
    var plan = new Plan('ZH-L16A')
    assert.throws(function () {
      plan.setupDecoAlgorithm('invalid')
    })
  })

  it('should not throw an exception when different algorithm is selected', function () {
    var plan = new Plan('ZH-L16A')
    assert.doesNotThrow(function () { plan.setupDecoAlgorithm('ZH-L16A') })
    assert.doesNotThrow(function () { plan.setupDecoAlgorithm('ZH-L16B') })
    assert.doesNotThrow(function () { plan.setupDecoAlgorithm('ZH-L17B') })
    assert.doesNotThrow(function () { plan.setupDecoAlgorithm('BSAC88') })
  })

  it('should thrown an exception when no decompression algorithm is passed', function () {
    assert.throws(function () {
      new Plan()
    })
  })

  it('should setup the algorithm when setupDecoAlgorithm is called', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.deco === 'object')
  })

  it('should have a setEquipment function', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.setEquipment === 'function')
  })

  it('should only accept three types of equipment', function () {
    var plan = new Plan('ZH-L16A')
    assert.doesNotThrow(function () { plan.setEquipment('CCR') }) // Closed circuit rebreather
    assert.doesNotThrow(function () { plan.setEquipment('SCR') }) // Semi closed circuit rebreather
    assert.doesNotThrow(function () { plan.setEquipment('OC') }) // Open Circuit
    assert.throws(function () { plan.setEquipment('invalid') })
  })

  it('should throw an exception when an invalid equipment type is selected', function () {
    var plan = new Plan('ZH-L16A')
    assert.throws(function () {
      plan.setEquipment('invalid')
    })
  })

  it('should set the equipment type when calling setEquipment', function () {
    var plan = new Plan('ZH-L16A')
    plan.setEquipment('CCR')
    assert(plan.equipmentType === 'CCR')
  })

  it('should have a setLowSetPoint function', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.setLowSetPoint === 'function')
  })

  it('should have a setHighSetPoint function', function () {
    var plan = new Plan('ZH-L16A')
    assert(typeof plan.setHighSetPoint === 'function')
  })

  it('should set the dives low and high set points', function () {
    var plan = new Plan('ZH-L16A')
    plan.setLowSetPoint(0.7, 16)
    plan.setHighSetPoint(1.3, 4)
    assert(typeof plan.lowSetPoint === 'object')
    assert(typeof plan.highSetPoint === 'object')
  })

  it('should thrown an exception if the set point is considered dangerous', function () {
    var plan = new Plan('ZH-L16A')
    assert.throws(function () { plan.setLowSetPoint(0.19) })
    assert.throws(function () { plan.setLowSetPoint(1.61) })
    assert.throws(function () { plan.setHighSetPoint(0.19) })
    assert.throws(function () { plan.setHighSetPoint(1.61) })
  })

  it.only('should run this test', function () {
    var plan = new Plan('ZH-L16A')
      , waypoints = []
      , lowSetPoint = new Gas(100, 0, 0.7)
      , highSetPoint = new Gas(100, 0, 1.6)
      , highSetPoint2 = new Gas(100, 0)

    // console.log('hsp',highSetPoint.getPPO2(6))
    // console.log('hsp',highSetPoint2.getPPO2(6))

    waypoints.push(new WayPoint(7, 0.35, lowSetPoint))
    waypoints.push(new WayPoint(30, 5, highSetPoint))
    waypoints.push(new WayPoint(30, 40, highSetPoint))
    waypoints.push(new WayPoint(3, 4.7, highSetPoint))
    waypoints.push(new WayPoint(0, 1, lowSetPoint))

    plan.setGradientFactors(0.8, 0.3)

    var results = plan.calculateProfile(waypoints)

    console.log(results)

  })
})
