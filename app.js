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

io.on('connection', (socket) => {

  socket.on('newPlayer', (location) => { // e.g. "toronto"

    if (places.hasOwnProperty(location)) {
      socket.location = location
      places[socket.location]['playerCount'] += 1
      socket.emit('connectSuccess', places[location])
      socket.join(socket.location)
      socket.to(socket.location).emit('playerCountChange', places[socket.location]['playerCount'])

      console.log(location + ': ' + places[socket.location]['playerCount'] + ' users')
    } else {
      socket.emit('connectFail')
    }
  })

  socket.on('disconnect', () => {
    console.log('Client Disconnected')
    if (places.hasOwnProperty(socket.location)) {
      places[socket.location]['playerCount'] -= 1
      socket.to(socket.location).emit('playerCountChange', places[socket.location]['playerCount'])

      console.log(socket.location + ': ' + places[socket.location]['playerCount'] + ' users')
    }
  })

  socket.on('newPlant', (plant) => { // {pos: [x: 0, y: 0], type: ''}

    maps.newPlant(places, socket.location, plant, (data) => { 
      io.sockets.in(socket.location).emit('tileChange', data)
    })
  })

  socket.on('waterPlant', (pos) => { // pos: [x: 0, y: 0]

    maps.waterPlant(places, socket.location, pos, (data) => {
      io.sockets.in(socket.location).emit('tileChange', data)
    })
  })
})

function startDataRefreshes() { // initialize function

  // TODO: Get an actual island map
  // Also, change the map size from 5x5 to 30x30
  places = templates.getPlaces()
  // console.log(places)

  maps.updateWeather(places, io)
  setInterval(() => {
    maps.updateWeather(places, io)
  }, 10000)
}

startDataRefreshes()

http.listen(3001, () => console.log('Listening on port 3001'))

