module.exports = function (startDepth, endDepth, duration, gas, deco) {
  deco = deco || false
  return {
      startDepth: startDepth
    , endDepth: endDepth
    , duration: duration
    , gas: gas
    , deco: deco
  }
}
