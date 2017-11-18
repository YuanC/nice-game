const request = require('request')
const templates = require('./templates.js')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

let exp = module.exports = { }

exp.updateWeather = (places, socket) => {
  console.log('\nFetching Weather:')

  // Updates precipitation for each place
  let placesLength = Object.keys(places).length

	for (let placeKey in places) { 
	  let xmlhttp = new XMLHttpRequest()
		xmlhttp.onreadystatechange = () =>  {

	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        // get weather data from json and check periods precipitation
        let weatherData = JSON.parse(xmlhttp.responseText);
      	places[placeKey]['precip'] = weatherData.data.periods && (weatherData.data.periods[0]['intensity'] != '0')
        console.log(placeKey + ' precip: ' + places[placeKey]['precip'])
        placesLength--

	    } else if (xmlhttp.status == 403 || xmlhttp.status == 404) {

        console.log('Could not get data')
        places[placeKey]['precip'] = false
        console.log(placeKey + ' precip: ' + places[placeKey]['precip'])
        placesLength--

    	}

      if (placesLength == 0) {
        updateMapState(places, socket)
      }
		}
		xmlhttp.open("GET", "https://hackathon.pic.pelmorex.com/api/data/ssp?locationcode=" + places[placeKey].weather_api_id, true)
		xmlhttp.send()
	}
}

function updateMapState (places, socket) {
  console.log('Updating Maps:')

  let placesLength = Object.keys(places).length

  for (let placeKey in places) {

    let map = places[placeKey]['map']

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        
        let tile = map[i][j]

        if (tile && tile['type'] === 'ground' && tile['plant']){
          // console.log(tile)
          updateTile(tile, places[placeKey]['precip'])
        }
      }
    }

    socket.to(placeKey).emit('mapRefresh', places[placeKey])
    console.log(placeKey + ' updated')

  }
}

const VALUES = {
  dry_change: -10,
  wet_change: 5,
  water_change: 20
}

function updateTile (tile, precip) {

  if (tile['plant']['stage'] < 3) {
    tile['plant']['progress'] += (precip ? VALUES.wet_change : VALUES.dry_change)

    if (tile['plant']['progress'] >= 100) {
      tile['plant']['progress'] = 0
      tile['plant']['stage'] = tile['plant']['stage'] + 1

    } else if (tile['plant']['progress'] < 0) {
      tile['plant']['progress'] = 90
      tile['plant']['stage'] = tile['plant']['stage'] - 1

      if (tile['plant']['stage'] < 0) {
        tile['plant'] = null
      }
    }
  }
}

exp.newPlant = (places, placeKey, plant, callback) => {
  places[placeKey]['map'][plant.pos[0]][plant.pos[1]]['plant'] = { 
    'type': plant.type,
    'progress': 70,
    'state': 0
  }
  callback({'pos': plant.pos,
    'tile': places[placeKey]['map'][plant.pos[0]][plant.pos[1]]})
}

exp.waterPlant = (places, placeKey, pos, callback) => {
  
  if (places[placeKey]['map'][pos[0]][pos[1]]['plant']['stage'] < 3) {

    places[placeKey]['map'][pos[0]][pos[1]]['plant']['progress'] += water_change

    if (tile['plant']['progress'] >= 100) {

      tile['plant']['progress'] = 0
      tile['plant']['stage'] = tile['plant']['stage'] + 1

    } else if (tile['plant']['progress'] < 0) {

      tile['plant']['progress'] = 90
      tile['plant']['stage'] = tile['plant']['stage'] - 1

      if (tile['plant']['stage'] < 0) {
        tile['plant'] = null
      }
    }

    callback({'pos': pos,
      'tile': places[placeKey]['map'][pos[0]][pos[1]]})
  }
}

exp.generateMap = () => {
  console.log('Generating Map')
  // return tile matrix
}

