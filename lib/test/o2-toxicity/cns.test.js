var cns = require('../../o2-toxicity/cns')
  , assert = require('assert')
  , Gas = require('npm-buhlmann-ZH-L16').Gas
  , gas

describe('CentralNervousSystem', function () {
  before(function () {
    gas = new Gas(32, 0)
  })

  it('should export an object with two functions', function () {
    assert(typeof cns === 'object')
    assert.equal(Object.keys(cns).length, 2)
    assert(typeof cns.getCNSForChangingDepth === 'function')
    assert(typeof cns.getCNSForFixedDepth === 'function')
  })

  it('should return a number when calling getCNSForFixedDepth', function () {
    assert(typeof cns.getCNSForFixedDepth(40, 22, gas) === 'number')
  })

  it('should return the expected result when getCNSForFixedDepth is called', function () {
    assert.equal(cns.getCNSForFixedDepth(40, 22, gas), 36.64)
  })

  it('should return the expected result when getCNSForChangingDepth is called', function () {
    assert.equal(cns.getCNSForChangingDepth(0, 40, 40, gas), 0.31)
  })
})
