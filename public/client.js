var socket = io.connect();
var placeName = window.location.pathname.toLowerCase().substring(1);

socket.on('connectSuccess', function (data) {
  console.log(data);
  startBabylon();
})

socket.on('connectFail', function () {
  socket.disconnect(true);
  alert('Sorry, this location is not available, please try another URL');
})

socket.on('receiveUpdate', function () { // sync with server state

})

// All the actions will be sent below to the server
// For the sake of time (against good practise), cooldowns will be client-side

function initSocket() {
  console.log('Initialize connection');
  console.log(placeName);
  socket.emit('newPlayer', placeName);

}

window.addEventListener('DOMContentLoaded', initSocket);
