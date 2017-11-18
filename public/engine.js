// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 5;
var treeSize = 1;

/*
Please refer to engine_helpers.js for necessary function calls
*/

var createScene = function () {

  scene = new BABYLON.Scene(engine);

  // Create a rotating camera
  camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoTop = 5;
  camera.orthoBottom = -5;
  camera.orthoLeft = -5;
  camera.orthoRight = 5;
  camera.lowerRadiusLimit = 12;
  camera.upperRadiusLimit = 12;
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

  // Make array of references here

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

  // Need to determine coords first, all params necessary
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
            // Need to update server array
            console.log("No plant here, can plant something");                        
            var objCoordX = getObjCoordX(widthIsOdd, gameGridX, tileWidth, numTilesWidth);
            var objCoordZ = getObjCoordZ(heightIsOdd, gameGridZ, tileHeight, numTilesHeight);
            createTree(objCoordX, objCoordZ, treeSize, scene);
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