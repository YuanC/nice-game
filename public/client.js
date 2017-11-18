var socket = io.connect();
var placeName = window.location.pathname.toLowerCase();

socket.on('connectSuccess', function () {
  // get location name through 'window.location.pathname.toLowerCase()'
  startBabylon();
})

socket.on('connectFail', function () {
  alert('Sorry, this location is not available, please try another URL');
})

socket.on('receiveUpdate', function () { // sync with server state

})

// All the actions will be sent below to the server
// For the sake of time (against good practise), cooldowns will be client-side

function initSocket() {
  console.log('Initialize connection');
  socket.emit('newPlayer', placeName);

}

window.addEventListener('DOMContentLoaded', initSocket);
