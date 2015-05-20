module.exports = MapWay

function MapWay (way) {
  if (typeof (way) === 'number') return way
  return ({
    '<>': MapWay.BOTH,
    '=': MapWay.BOTH,
    '<': MapWay.UP,
    '>': MapWay.DOWN
  })[way]
}

MapWay.UP = parseInt('10', 2)
MapWay.DOWN = parseInt('01', 2)
MapWay.BOTH = MapWay.UP | MapWay.DOWN
