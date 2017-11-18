// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 20;

function generateMapTiles(tiledGround, mapTemplate, subdivisions) {
  // Needed variables to set subMeshes
  var verticesCount = tiledGround.getTotalVertices();
  var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);
  
  // Set subMeshes of the tiled ground
  tiledGround.subMeshes = [];
  var base = 0;
  for (var row = 0; row < subdivisions.h; row++) {
    for (var col = 0; col < subdivisions.w; col++) {
      if(mapTemplate[row][col] === null) {
        tiledGround.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, base , tileIndicesLength, tiledGround));                
        base += tileIndicesLength;
      }
      else if(mapTemplate[row][col].type === 'ground') {
        tiledGround.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, base , tileIndicesLength, tiledGround));
        base += tileIndicesLength;                
      }
      else if(mapTemplate[row][col].type === 'water') {
        tiledGround.subMeshes.push(new BABYLON.SubMesh(2, 0, verticesCount, base , tileIndicesLength, tiledGround));                                
        base += tileIndicesLength;                
      }
      else { // Tile type does not exist
        console.log("Map tile type invalid");
        tiledGround.subMeshes.push(new BABYLON.SubMesh(3, 0, verticesCount, base , tileIndicesLength, tiledGround));                                
        base += tileIndicesLength;
      }
    }
  }
}

// Helper functions to get world coords from game grid coords
// Start at first tile (0,0), get midpoint of side lengths 
// Have to account for odd/even
function getObjCoordX(widthIsOdd, gameGridX, tileWidth, numTilesWidth) {
  var objCoordX = 0;
  if(widthIsOdd === true) {
    // Map to 0
    objCoordX -= tileWidth * Math.floor(numTilesWidth / 2);
    objCoordX += gameGridX * tileWidth;
  }
  else {
    objCoordX -= tileWidth / 2 + (tileWidth * Math.floor(numTilesWidth / 2));
    objCoordX += (gameGridX + 1) * tileWidth;                
  }
  return objCoordX;
}

function getObjCoordZ(heightIsOdd, gameGridZ, tileHeight, numTilesHeight) {
  var objCoordZ = 0;
  if(heightIsOdd === true) {
    objCoordZ -= (tileHeight * Math.floor(numTilesHeight / 2));
    objCoordZ += gameGridZ * tileHeight;
  }
  else {
    objCoordZ -= tileHeight / 2 + (tileHeight * Math.floor(numTilesHeight / 2));
    objCoordZ += (gameGridZ + 1) * tileHeight;
  }
  return objCoordZ;
}

function refreshMapObjects(mapTemplate, subdivisions, widthIsOdd, tileWidth, numTilesWidth, heightIsOdd, tileHeight, numTilesHeight, scene) {
  console.log("--- Refreshing map objects...");
  for (var row = 0; row < subdivisions.h; row++) {
    for (var col = 0; col < subdivisions.w; col++) {
      if(mapTemplate[row][col] !== null) {
        var currentType = mapTemplate[row][col].type;
        console.log("Current type: " + currentType);
        if(currentType === 'ground') {
          var currentPlant =  mapTemplate[row][col].plant;
          if(currentPlant !== null) {
            // Show existing plant
            console.log("Map already has this plant: " + currentPlant.type);
            // Temporary placeholder tree thing
            var blueBox = BABYLON.Mesh.CreateBox("blueBox", 1, scene);
            var blueMat = new BABYLON.StandardMaterial("ground", scene);
            blueMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            blueMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            blueMat.emissiveColor = BABYLON.Color3.Blue();
            blueBox.material = blueMat;
            var objCoordX = getObjCoordX(widthIsOdd, col, tileWidth, numTilesWidth);
            var objCoordZ = getObjCoordZ(heightIsOdd, row, tileHeight, numTilesHeight);
            console.log("Current object game coord: (" + objCoordX + ", " + objCoordZ + ")");                            
            blueBox.position.x = objCoordX;
            blueBox.position.z = objCoordZ;
          }
          else {
            // No plant object here
          }
        }            
      }
    }
  }
}

// Map to array indices
function getGameGridX(x, widthIsOdd, tileWidth, subdivisions) {
  var gameGridX = 0;
  if(widthIsOdd === true) {
    if(x >= 0) { // x is positive
      while(x >= 0) {
        x -= tileWidth;
        // Based on the condition map is generated starting from 0,0 
        if(x >= (0 - (tileWidth / 2))) {
          gameGridX++;
        }
      }
    }
    else { // x is negative
      while(x < 0) {
        x += tileWidth;
        if(x < (0 + (tileWidth / 2))) {
          gameGridX--;
        }
      }
    }
  }
  else { // width is even
    if(x >= 0) { // x is positive
    gameGridX++;
      while(x >= 0) {
        x -= tileWidth;
        if(x >= 0) {
          gameGridX++;
        }
      }
    }
    else { // x is negative
      while(x < 0) {
        x += tileWidth;
        if(x < 0) {
          gameGridX--;
        }
      }
    }
  }
  if(widthIsOdd === true) {
    gameGridX += Math.floor(subdivisions.w / 2);
  }
  else {
    gameGridX += Math.floor(subdivisions.w / 2) - 1;
  }
  return Math.abs(gameGridX);
}
function getGameGridZ(z, heightIsOdd, tileHeight, subdivisions) {
  var gameGridZ = 0;
  if(heightIsOdd === true) {
    if(z >= 0) { // z is positive
      while(z >= 0) {
        z -= tileHeight;
        if(z >= (0 - (tileHeight / 2))) {
          gameGridZ++;
        }
      }
    }
    else { // z is negative
      while(z < 0) {
        z += tileHeight;
        if(z < (0 + (tileHeight / 2))) {                        
          gameGridZ--;
        }
      }
    }
  }
  else {
    if(z >= 0) { // z is positive
      gameGridZ++;
      while(z >= 0) {
        z -= tileHeight;
        if(z >= 0) {
          gameGridZ++;
        }
      }
    }
    else { // z is negative
      while(z < 0) {
        z += tileHeight;
        if(z < 0) {                        
          gameGridZ--;
        }
      }
    }
  }
  if(heightIsOdd === true) {
    gameGridZ += Math.floor(subdivisions.h / 2);
  }
  else {
    gameGridZ += Math.floor(subdivisions.h / 2) - 1;
  }
  return Math.abs(gameGridZ);
}

var createScene = function () {

  scene = new BABYLON.Scene(engine);

  // Create a rotating camera
  camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  camera.orthoTop = cam_height;
  camera.orthoBottom = -cam_height;
  var wh_ratio = window.innerWidth/window.innerHeight;
  camera.orthoLeft = -wh_ratio*cam_height;
  camera.orthoRight = wh_ratio*cam_height;

  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 10;
  camera.upperBetaLimit = Math.PI / 3;
  camera.lowerBetaLimit = Math.PI / 3;
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  // Add a light
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

  // Map size parameters: length and width must be pos. integers
  // Unrelated to number of tiles on map
  var width = 3;
  var height = 3;
  var xmin = width * -1;
  var zmin = height * -1;
  var xmax = width;
  var zmax = height;
  var precision = {
      "w" : 1,
      "h" : 1
  };

  // Get map from server
  var mapTemplate = data.map;

  // Map for debugging
  // var mapTemplate = [
  //     [null, null, null, null, null],
  //     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
  //     [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
  //     [{'type': 'water'}, {'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
  //     [null, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
  // ]

  // Determine map template number of tiles lengthwise and widthwise
  var numTilesWidth = 0;
  var numTilesHeight = 0;
  numTilesWidth = mapTemplate[0].length;
  numTilesHeight = mapTemplate.length;
  
  console.log("Template map dimensions: " + numTilesWidth + "x" + numTilesHeight);
  // Actual number of tiles
  var subdivisions = {
      'h' : numTilesHeight, // corresponds to z axis
      'w' : numTilesWidth  // corresponds to x axis
  };

  // Create the Tiled Ground
  var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, scene);

  // Create the multi material, set textures
  // Lawn green rgb(124,252,0)
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseColor = new BABYLON.Color3(124, 252, 0);
  // Deep sky blue rgb(0,191,255)
  var waterMaterial = new BABYLON.StandardMaterial("water", scene);
  waterMaterial.diffuseColor = new BABYLON.Color3(0, 191, 255);
  // Grey rgb(220,220,220)
  var errorMaterial = new BABYLON.StandardMaterial("error", scene);
  errorMaterial.diffuseColor = new BABYLON.Color3(220, 220, 220);
  // Null material
  var nullMaterial = new BABYLON.StandardMaterial("null", scene);
  nullMaterial.alpha = 0.0;
  
  // Position here matters, corresponds to index
  var multimat = new BABYLON.MultiMaterial("multi", scene);
  multimat.subMaterials.push(nullMaterial); //0
  multimat.subMaterials.push(groundMaterial); //1
  multimat.subMaterials.push(waterMaterial); //2
  multimat.subMaterials.push(errorMaterial); //3

  // Apply the multi material
  tiledGround.material = multimat;

  // Generate map
  generateMapTiles(tiledGround, mapTemplate, subdivisions);

  // Some math variables for grid calculations
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

  // Need to determine coords first
  // All params necessary
  refreshMapObjects(mapTemplate, subdivisions, widthIsOdd, tileWidth, numTilesWidth, heightIsOdd, tileHeight, numTilesHeight, scene);
  
  //When pointer down event is raised
  scene.onPointerDown = function (evt, pickResult) {
    // if the click hits the ground object
    if (pickResult.hit) {
      // z is the depth, which is basically our y
      x = pickResult.pickedPoint.x;
      z = pickResult.pickedPoint.z;
      console.log("World coords: (" + x + ", " + z + ")");
      // Begin converting to game grid
      var gameGridX = getGameGridX(x, widthIsOdd, tileWidth, subdivisions);
      var gameGridZ = getGameGridZ(z, heightIsOdd, tileHeight, subdivisions);
      
      console.log("Mapped game grid to array coords: (" + gameGridX + ", " + gameGridZ + ")");

      if(mapTemplate[gameGridZ][gameGridX] !== null) {
        var currentType = mapTemplate[gameGridZ][gameGridX].type;
        console.log("Player selected this tile: " + currentType);    
        if(currentType === 'ground') {
          var currentPlant =  mapTemplate[gameGridZ][gameGridX].plant;
          if(currentPlant !== null) {
            console.log("This plant is here: " + currentPlant.type);
          }
          else {
            // Can make new plant
            console.log("No plant here, can plant something");                        
            var greenBox = BABYLON.Mesh.CreateBox("greenBox", 1, scene);
            var greenMat = new BABYLON.StandardMaterial("ground", scene);
            greenMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            greenMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            greenMat.emissiveColor = BABYLON.Color3.Green();
            greenBox.material = greenMat;
            var objCoordX = getObjCoordX(widthIsOdd, gameGridX, tileWidth, numTilesWidth);
            var objCoordZ = getObjCoordZ(heightIsOdd, gameGridZ, tileHeight, numTilesHeight);
            console.log("New object game coord: (" + objCoordX + ", " + objCoordZ + ")");                            
            greenBox.position.z = objCoordZ;
            greenBox.position.x = objCoordX;
          }
        }            
      }
    }
  };
  renderGUI();

  return scene;
}

function renderGUI () {
  // GUI
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  gui_placename = new BABYLON.GUI.TextBlock();
  gui_placename.text = placeName.charAt(0).toUpperCase() + placeName.slice(1);
  gui_placename.color = "white";
  gui_placename.fontSize = 72;
  gui_placename.fontFamily = "Arial";
  advancedTexture.addControl(gui_placename);
  gui_placename.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_placename.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_weather = new BABYLON.GUI.TextBlock();
  gui_weather.text = 'The weather is ' + (data.precip ? 'wet': 'dry');
  gui_weather.color = "white";
  gui_weather.fontSize = 26;
  gui_weather.paddingTop = 72;
  gui_weather.paddingLeft = 8;
  gui_weather.fontFamily = "Arial";
  advancedTexture.addControl(gui_weather);
  gui_weather.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_weather.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_usercount = new BABYLON.GUI.TextBlock();
  gui_usercount.text = userCnt + ' user(s) connected';
  gui_usercount.color = "white";
  gui_usercount.fontSize = 14;
  gui_usercount.fontFamily = "Arial";
  advancedTexture.addControl(gui_usercount);
  gui_usercount.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  gui_usercount.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
}

function updateScene (newMap) {

  // socket.emit('plantSeed', data)
}

function startBabylon () {
  if (BABYLON.Engine.isSupported()) {

    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);

    engine.displayLoadingUI();
    scene = createScene();

    scene.executeWhenReady(function () {
      engine.hideLoadingUI();
      // console.log(socket);

      engine.runRenderLoop(function () {
        scene.render();
      });
    });

    window.addEventListener("resize", function () {
      engine.resize();

      var wh_ratio = window.innerWidth/window.innerHeight;
      camera.orthoLeft = -wh_ratio*cam_height;
      camera.orthoRight = wh_ratio*cam_height;
    });
  } else {
      alert("Sorry! Your browser isn't supported :(");
  }
}