// Game Data
const maps = require('./maps.js')
const templates = require('./templates.js')

// Server
const express = require('express')
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000

app.use('/public', express.static('public'))
app.get('/*', (req,res) => res.sendFile(__dirname + '/index.html'))

let places

io.on('connection', (socket) => {

  // Announces new player, sends them map state
  socket.on('newPlayer', (location) => { // e.g. "toronto"

    if (places.hasOwnProperty(location)) {
      socket.location = location
      places[socket.location]['playerCount'] += 1
      socket.join(socket.location)
      socket.emit('connectSuccess', places[socket.location])
      socket.to(socket.location).emit('playerCountChange', places[socket.location]['playerCount'])

      console.log(socket.location + ': ' + places[socket.location]['playerCount'] + ' users')
    } else {
      socket.emit('connectFail')
    }
  })

  // Announces player departure
  socket.on('disconnect', () => {
    console.log('Client Disconnected')
    if (places.hasOwnProperty(socket.location)) {
      places[socket.location]['playerCount'] -= 1
      socket.to(socket.location).emit('playerCountChange', places[socket.location]['playerCount'])

      console.log(socket.location + ': ' + places[socket.location]['playerCount'] + ' users')
    }
  })

  // Sends new plant update to all players
  socket.on('newPlant', (plant) => { // {pos: [x: 0, y: 0], type: ''}

    maps.newPlant(places, socket.location, plant, (data) => { 
      io.sockets.in(socket.location).emit('tileChange', data)
    })
  })

  // Sends watering event to all players
  socket.on('waterPlant', (pos) => { // pos: [x: 0, y: 0]

    maps.waterPlant(places, socket.location, pos, (data) => {
      io.sockets.in(socket.location).emit('tileChange', data)
      io.sockets.in(socket.location).emit('sprinkle', data.pos)
    })
  })
})

function startDataRefreshes() { // initialize function
  places = templates.getPlaces()

  // Fetches the weather at an interval
  maps.updateWeather(places, io)
  setInterval(() => {
    maps.updateWeather(places, io)
  }, 10000)
}

startDataRefreshes()

http.listen(PORT, () => console.log('Listening on port ' + PORT))

