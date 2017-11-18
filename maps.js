const request = require('request')
const templates = require('./templates.js')

// getting error, "XMLHttpRequest is not a constructor" ? also (fixed)
// did npm install xmlhttprequest
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
// global.XMLHttpRequest = require("xmlhttprequest")
// const { XMLHttpRequest } = require('sdk/net/xhr');

let exp = module.exports = { }

const api_url = 'https://hackathon.pic.pelmorex.com/api/data/ssp'

exp.updateWeather = (places) => {
  console.log('updating map')

  // fetches weather from API for each location in places
  // getting json from weather network
  // for each location, get the json data
  // TODO: How to go through each place (E.g. london and vancouver and get the data for each?)

	// for (let location in places) { 
	  var xmlhttp = new XMLHttpRequest()
		xmlhttp.onreadystatechange = function() {
		    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		        var weatherData = JSON.parse(xmlhttp.responseText);
		        // document.getElementById("demo").innerHTML = weatherData.name;
		        console.log(weatherData) // retrieving the data
		        console.log(places.london.weather_api_id)
		        // get weather data from json and check periods precipitation
		        if(weatherData.data.periods && weatherData.data.periods[0].precipType != "0"){
		        	places.london.precip = true
		        }
		    }
		    else if (xmlhttp.status == 403 || xmlhttp.status == 404) {
	          console.log('Could not get data')
	      	}
		};
		xmlhttp.open("GET", "https://hackathon.pic.pelmorex.com/api/data/ssp?locationcode=" + places.london.weather_api_id, true);
		xmlhttp.send();
	// }
  // if periods && periods[0]['intensity'] != "0" {
    // set place.precip to true
  // else false

  // updates plants
}

exp.generateMap = () => {
  console.log('Generating Map')
  // return tile matrix
}

// Game Data Representation

// Generation

// State of each Tile

// update functions for each 

