let exp = module.exports = { }

let mapTemplate = [
  [null, null, null, null, null],
  [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
  [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
  [{'type': 'water'}, {'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
  [null, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
]

exp.placesTemplate = {
  'london': {
    'playerCount': 0,
    'map': mapTemplate.slice(0),
    'percip': false,
    'weather_api_id': 'CAON0383'
  },
  'vancouver': {
    'playerCount': 0,
    'map': mapTemplate.slice(0),
    'percip': false,
    'weather_api_id': 'CABC0308'
  }
}

// map template
// places templates