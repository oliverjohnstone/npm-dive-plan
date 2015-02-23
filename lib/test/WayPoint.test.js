var WayPoint = require('../WayPoint')
  , assert = require('assert')

describe('WayPoint', function () {
  it('should export a function', function () {
    assert(typeof WayPoint === 'function')
  })

  it('should have the correct property accessors', function () {
    var wayPoint = new WayPoint(10, 10, {})
    assert(typeof wayPoint.getGas === 'function')
    assert(typeof wayPoint.getDuration === 'function')
    assert(typeof wayPoint.getDepth === 'function')
  })

  it('should return the correct properties', function () {
    var gas = { }
      , wayPoint = new WayPoint(10, 20, gas)
    assert.equal(wayPoint.getGas(), gas)
    assert.equal(wayPoint.getDepth(), 10)
    assert.equal(wayPoint.getDuration(), 20)
  })
})
