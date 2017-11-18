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
        console.log(placeKey + ' precip set to ' + places[placeKey]['precip'])
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
          updateTile(tile, places[placeKey]['precip'])
          // console.log('plant')
        }

      }
    }

    socket.to(placeKey).emit('mapRefresh', places[placeKey])
    console.log(placeKey + ' updated')

  }

}

function updateTile (tile, precip) {

  if (precip) {

  } else {

  }

}

exp.newPlant = (places, placeKey, pos, callback) => {

}

exp.waterPlant = (places, placeKey, pos, callback) => {
  
}

exp.generateMap = () => {
  console.log('Generating Map')
  // return tile matrix
}

// Game Data Representation

// Generation

// State of each Tile

// update functions for each 

