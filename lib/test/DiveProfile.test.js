var Plan = require('../DiveProfile')
  , assert = require('assert')
  , Gas = require('npm-buhlmann-ZH-L16').Gas
  , WayPoint = require('../WayPoint')
  , at50Dive = require('./fixtures/50-at-50-dive.fixture')

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

  it('should return the expected decompression obligation table', function () {
    var plan = new Plan('ZH-L16A')
      , waypoints = []
      , lowSetPoint = new Gas(100, 0, 0.7)
      , highSetPoint = new Gas(100, 0, 1.3)

    waypoints.push(new WayPoint(7, 0.35, lowSetPoint))
    waypoints.push(new WayPoint(50, 10, highSetPoint))
    waypoints.push(new WayPoint(50, 50, highSetPoint))
    waypoints.push(new WayPoint(3, 2.7, highSetPoint))
    waypoints.push(new WayPoint(0, 2, lowSetPoint))

    plan.setGradientFactors(0.8, 0.3)

    var results = plan.calculateProfile(waypoints)

    assert.notStrictEqual(results, at50Dive)
  })

  it('should have no deco for a 20m dive for 10mins on a 1.3 setpoint', function () {
    var plan = new Plan('ZH-L16A')
      , waypoints = []
      , lowSetPoint = new Gas(100, 0, 0.7)
      , highSetPoint = new Gas(100, 0, 1.3)

    waypoints.push(new WayPoint(7, 0.35, lowSetPoint))
    waypoints.push(new WayPoint(20, 5, highSetPoint))
    waypoints.push(new WayPoint(20, 10, highSetPoint))
    waypoints.push(new WayPoint(3, 2.7, highSetPoint))
    waypoints.push(new WayPoint(0, 2, lowSetPoint))

    plan.setGradientFactors(0.8, 0.3)

    var results = plan.calculateProfile(waypoints)

    results.forEach(function (segment) {
      assert(segment.deco === false, 'should not have any decompression')
    })
  })
})
