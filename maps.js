const request = require('request')
const templates = require('./templates.js')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

let exp = module.exports = { }

// Fetches the water and updates state if necessary
exp.updateWeather = (places, socket) => {
  console.log('\nFetching Weather:')

	for (let placeKey in places) { 
	  let xmlhttp = new XMLHttpRequest()
		xmlhttp.onreadystatechange = () =>  {

	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        // get weather data from json and check periods precipitation
        let weatherData = JSON.parse(xmlhttp.responseText);
      	places[placeKey]['precip'] = weatherData.data.periods && (weatherData.data.periods[0]['intensity'] != '0')
        updatePlace(placeKey, places, socket)


	    } else if (xmlhttp.status == 403 || xmlhttp.status == 404) {

        console.log('Could not get data')
        places[placeKey]['precip'] = false
        updatePlace(placeKey, places, socket)

    	}
		}
		xmlhttp.open("GET", "https://hackathon.pic.pelmorex.com/api/data/ssp?locationcode=" + places[placeKey].weather_api_id, true)
		xmlhttp.send()
	}
}

// Updates the current state of the grid
function updatePlace (placeKey, places, socket) {
  let map = places[placeKey]['map']

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      
      let tile = map[i][j]

      // Increment tile state if there's a plant
      if (tile && tile['type'] === 'ground' && tile['plant']){
        updateTile(tile, places[placeKey]['precip'])
      }
    }
  }

  socket.to(placeKey).emit('mapRefresh', places[placeKey])
  console.log(placeKey + ' updated: ' + places[placeKey]['precip'])
}

const VALUES = {
  dry_change: -10,
  wet_change: 5,
  water_change: 20
}

// Updates the tile state
function updateTile (tile, precip) {

  if (tile['plant']['stage'] < 1) {
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

// Adds a new plant at specified location
exp.newPlant = (places, placeKey, plant, callback) => {

  if (plant && plant.pos && plant.pos.length === 2 && plant.type
    && places && placeKey in places && places[placeKey]) {

    let tile = places[placeKey]['map'][plant.pos[0]][plant.pos[1]]
    
    if (!tile['plant']) {
      console.log(tile)
      tile['plant']  = { 
        'type': plant.type,
        'progress': 30,
        'stage': 0
      }
      callback({'pos': plant.pos, 'tile': tile})
    } 
  }
}

// Waters a specified plant
exp.waterPlant = (places, placeKey, pos, callback) => {

  if (pos && pos.length === 2 && places && placeKey in places && places[placeKey]) {

    let tile = places[placeKey]['map'][pos[0]][pos[1]]

    if (tile['plant']['stage'] < 3) {

      tile['plant']['progress'] += VALUES.water_change

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

      callback({'pos': pos, 'tile': tile})
    }
  }
}

exp.generateMap = () => {
  console.log('Generating Map')
  // return tile matrix
}

