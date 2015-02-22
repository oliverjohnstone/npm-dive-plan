var assert = require('assert')
  , createSetPoint = require('../create-setpoint')

describe('createSetPoint', function () {
  it('should export a function', function () {
    assert(typeof createSetPoint === 'function')
  })

  it('should return an object', function () {
    assert(typeof createSetPoint(1.3, 6) === 'object')
  })

  it('should have the correct properties in the object', function () {
    var result = createSetPoint(1.3, 6)

    assert.equal(result.setpoint, 1.3)
    assert.equal(result.switchDepth, 6)
  })
})
