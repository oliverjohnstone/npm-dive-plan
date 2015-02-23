module.exports = WayPoint

function WayPoint(depth, duration, gas) {
  this.depth = depth
  this.duration = duration
  this.gas = gas
}

WayPoint.prototype.getGas = function () {
  return this.gas
}

WayPoint.prototype.getDuration = function () {
  return this.duration
}

WayPoint.prototype.getDepth = function () {
  return this.depth
}
