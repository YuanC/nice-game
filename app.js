// Game Data
const maps = require('./maps.js')
const templates = require('./templates.js')

// Server
const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/public', express.static('public'))
app.get('/*', (req,res) => res.sendFile(__dirname + '/index.html'))

let places

function resetData() { // initialize function
  places = templates.placesTemplate

  // generate maps, weather for each location
  for (let key in places) {
    if (places.hasOwnProperty(key)) {
      // places[key]['map'] = maps.generateMap()
      // places[key]['weather'] = maps.fetchWeather()
    }
  }

}

io.on('connection', (socket) => {
  console.log('Client Connected')
  var addedUser = false

  socket.on('newPlayer', (location) => {

    if (places.hasOwnProperty(location)) {
      socket.location = location
    } else {
      // socket.emit()
    }
  })

  socket.on('plantSeed', (data) => {
    // socket.emit()
  })

  socket.on('disconnect', () => console.log('Client Disconnected'))
})


resetData()

// Update map state (weather, plant status)
setInterval(() => {
  maps.updateWeather(places)
}, 10000)

http.listen(3000, () => console.log('Listening on port 3000'))

