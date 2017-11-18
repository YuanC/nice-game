let exp = module.exports = { }
const deep_copy_array_or_object = (obj => JSON.parse (JSON.stringify(obj)));

let mapTemplate = [
  [null, null, null, null, null],
  [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
  [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 20, 'stage': 0}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
  [{'type': 'water'}, {'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 2}}, {'type': 'water'}, {'type': 'water'}],
  [null, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null],
]

// For testing
// Template map (odd)
// var mapTemplate = [
//     [null, null, null, null, null],
//     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
//     [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
//     [{'type': 'water'}, {'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
//     [null, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
// ]
// Template map (even)
// var mapTemplate = [
//     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
//     [{'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
//     [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
//     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
// ]

exp.getPlaces = () => {

  let places = {
    'london': {
      'playerCount': 0,
      'map': null,
      'precip': false,
      'weather_api_id': 'CAON0383'
    },
    'vancouver': {  
      'playerCount': 0,
      'map': null,
      'precip': false,
      'weather_api_id': 'CABC0308'
    },
    'toronto': {
      'playerCount': 0,
      'map': null,
      'precip': false,
      'weather_api_id': 'CAON0696'
    }
  }

  for (let place in places) {
    places[place]['map'] = deep_copy_array_or_object(mapTemplate)
  }

  return places
}


// map template
// places templates