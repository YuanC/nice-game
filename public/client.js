var socket = io.connect();
var placeName = window.location.pathname.toLowerCase().substring(1);

var data, userCnt;

socket.on('connectSuccess', function (succ) {
  data = succ;
  console.log(succ);
  userCnt = data.playerCount;
  startBabylon();
})

socket.on('connectFail', function () {
  socket.disconnect(true);
  alert('Sorry, this location is not available, please try another URL');
})

socket.on('mapRefresh', function (place) { // sync with server state
  console.log('Sync with server: ');
  console.log(place);
  mapTemplate = place['map'];

  var width = 3;
  var height = 3;
  var xmin = width * -1;
  var zmin = height * -1;
  var xmax = width;
  var zmax = height;
  
  var numTilesWidth = 0;
  var numTilesHeight = 0;
  numTilesWidth = mapTemplate[0].length;
  numTilesHeight = mapTemplate.length;
  
  // Actual number of tiles
  var subdivisions = {
      'h' : numTilesHeight, // corresponds to z axis
      'w' : numTilesWidth  // corresponds to x axis
  };

  var widthTotalDistance = Math.abs(xmax - xmin);
  var heightTotalDistance = Math.abs(zmax - zmin);
  var tileWidth = widthTotalDistance / subdivisions.w;
  var tileHeight = heightTotalDistance / subdivisions.h;
  // Odd/even flags
  var widthIsOdd;
  if(subdivisions.w % 2 !== 0) {
      widthIsOdd = true;
  }
  else {
      widthIsOdd = false;
  }
  var heightIsOdd;
  if(subdivisions.h % 2 !== 0) {
      heightIsOdd = true;
  }
  else {
      heightIsOdd = false;
  }

  refreshMapObjects(mapTemplate, subdivisions, widthIsOdd, tileWidth, 
    numTilesWidth, heightIsOdd, tileHeight, numTilesHeight, scene);
  
})

socket.on('tileChange', function (data) { // update given tile
  console.log(data); // {pos: [], tileState: {}}
})

socket.on('playerCountChange', function (count) {
  // console.log('Player Count: ');
  // console.log(count);
  userCnt = count;
  gui_usercount.text = userCnt + ' user(s) connected';
  
})

// All the actions will be sent below to the server
// For the sake of time (against good practise), cooldowns will be client-side

function initSocket() {
  console.log('Initialize connection');
  console.log(placeName);
  socket.emit('newPlayer', placeName);

}

window.addEventListener('DOMContentLoaded', initSocket);
