var Plan = require('../index')
  , assert = require('assert')

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
})
