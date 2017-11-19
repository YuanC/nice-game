var socket = io.connect();
var placeName = window.location.pathname.toLowerCase().substring(1);

var data, userCnt, raining;

socket.on('connectSuccess', function (succ) {
  data = succ;
  console.log(succ);
  userCnt = data.playerCount;
  raining = !data.precip;
  startBabylon();
})

socket.on('connectFail', function () {
  socket.disconnect(true);
  alert('Sorry, this location is not available, please try another URL');
})

socket.on('tileChange', function (data) { // update given tile
  console.log('Tile Change'); // {pos: [], tileState: {}}
  console.log(data); // {pos: [], tileState: {}}
  refreshMapTile(data.pos, data.tile);
})

socket.on('playerCountChange', function (count) {
  // console.log('Player Count: ');
  // console.log(count);
  userCnt = count;
  gui_usercount.text = userCnt + ' user(s) connected';
  
})

socket.on('mapRefresh', function (place) { // sync with server state
  console.log('Sync with server: ');
  console.log(place);
  mapTemplate = place['map'];

  updateWeather();
  refreshMapObjects();
  
})

// All the actions will be sent below to the server
// For the sake of time (against good practise), cooldowns will be client-side

function initSocket() {
  console.log('Initialize connection');
  console.log(placeName);
  socket.emit('newPlayer', placeName);

}

window.addEventListener('DOMContentLoaded', initSocket);
