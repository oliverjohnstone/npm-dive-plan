var calculatePulmonaryToxicDose = require('../../o2-toxicity/calculate-pulmonary-toxic-dose')
  , assert = require('assert')

describe('calculatePulmonaryToxicDose', function () {
  it('should export an object with two functions', function () {
    assert(typeof calculatePulmonaryToxicDose === 'object')
    assert(typeof calculatePulmonaryToxicDose.getCPTDForFixedDepth === 'function')
    assert(typeof calculatePulmonaryToxicDose.getCPTDForChangingDepth === 'function')
    assert.equal(Object.keys(calculatePulmonaryToxicDose).length, 2)
  })
  // TODO
})
