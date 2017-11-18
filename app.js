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

  // TODO: Actually generate the correct stuff lol
  maps.updateWeather(places)
  
  setInterval(() => {
    maps.updateWeather(places)
  }, 10000)
}

io.on('connection', (socket) => {
  console.log('Client Connected')
  var addedUser = false

  socket.on('newPlayer', (location) => {

    if (places.hasOwnProperty(location)) {
      socket.location = location
      places[socket.location]['playerCount'] += 1
      socket.emit('connectSuccess', places[location])
      // socket.
    } else {
      socket.emit('connectFail')
    }
  })

  socket.on('disconnect', () => {
    console.log('Client Disconnected')
    if (places.hasOwnProperty(socket.location)) {
      places[socket.location]['playerCount'] -= 1
    }
  })

})


resetData()

// Update map state (weather, plant status)
setInterval(() => {
  maps.updateWeather(places)
}, 10000)

http.listen(3000, () => console.log('Listening on port 3000'))

