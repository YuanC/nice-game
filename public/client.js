var socket = io.connect();
var placeName = window.location.pathname.toLowerCase().substring(1);

var map, weathertext;

socket.on('connectSuccess', function (data) {
  console.log(data);
  startBabylon();
})

socket.on('connectFail', function () {
  socket.disconnect(true);
  alert('Sorry, this location is not available, please try another URL');
})

socket.on('mapRefresh', function (places) { // sync with server state
  console.log('Sync with server: ');
  console.log(places);
})

socket.on('tileChange', function (data) { // sync with server state
  console.log(data); // {pos: [], tileState: {}}
})

socket.on('playerCountChange', function (count) {
  console.log('Player Count: ');
  console.log(count);
})

// All the actions will be sent below to the server
// For the sake of time (against good practise), cooldowns will be client-side

function initSocket() {
  console.log('Initialize connection');
  console.log(placeName);
  socket.emit('newPlayer', placeName);

}

window.addEventListener('DOMContentLoaded', initSocket);
