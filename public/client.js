var socket;

function initSocket() {
  socket = io.connect();

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

}

window.addEventListener('DOMContentLoaded', initSocket);


