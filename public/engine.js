// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 10, light;
var treeSize = 1;
var flowerSize = 0.5;
var shrubSize = 0.5;
var rainParticleSystem, rainMusic;
var treeMatrix, mapTemplate;
var plantActionCd = 10000; // in milliseconds
var firstAction = true;

// Victor's variables
var width = 15;
var height = 15;
var xmin, zmin;
var xmax, zmax;
var precision;
var numTilesWidth, numTilesHeight;
var subdivisions;
var widthTotalDistance, heightTotalDistance;
var tileWidth, tileHeight;
var widthIsOdd, heightIsOdd;
var lights;
var highlighted = false;
var gameGridX = null;
var gameGridZ = null;

// GUI Actions
var plantButton, waterButton;
var plantPanel;
var treeButton, flowerButton, shrubButton;

var plantMaterials = {
  'sproutMaterial': null,
  'treeMaterial': null,
  'flowerMaterial': null,
  'shrubMaterial': null
};

/*
Please refer to engine_helpers.js for necessary function calls
*/

var createScene = function () {

  scene = new BABYLON.Scene(engine);

  // Create a rotating camera
  camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  var wh_ratio = window.innerWidth/window.innerHeight;
  camera.orthoTop = cam_height;
  camera.orthoBottom = -cam_height;
  camera.orthoLeft = -wh_ratio*cam_height;
  camera.orthoRight = wh_ratio*cam_height;

  camera.lowerRadiusLimit = 20;
  camera.upperRadiusLimit = 20;
  camera.upperBetaLimit = Math.PI / 3;
  camera.lowerBetaLimit = Math.PI / 4;
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  // Add a light
  lights = [];
  light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 0.5, 1), scene);
  light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, 0.5, -1), scene);
  lights.push(light1);
  lights.push(light2);
  for(var i = 0; i < lights.length; i++) {
    lights[i].specular = new BABYLON.Color3(0,0,0);
    lights[i].intensity = 1;
  }

  // Map size parameters: length and width must be pos. integers
  // Unrelated to number of tiles on map
  xmin = width * -1;
  zmin = height * -1;
  xmax = width;
  zmax = height;
  precision = {
      "w" : 1,
      "h" : 1
  };

  // Get map from server
  mapTemplate = data.map;

  // Determine map template number of tiles lengthwise and widthwise
  numTilesWidth = 0;
  numTilesHeight = 0;
  numTilesWidth = mapTemplate[0].length;
  numTilesHeight = mapTemplate.length;
  
  console.log("Template map dimensions: " + numTilesWidth + "x" + numTilesHeight);
  // Actual number of tiles
  subdivisions = {
      'h' : numTilesHeight, // corresponds to z axis
      'w' : numTilesWidth  // corresponds to x axis
  };

  initPlantMaterials();

  // Create the Tiled Ground
  var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, scene);

  // Create the multi material, set textures
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("./public/textures/ground.png", scene);
  // 
  var waterMaterial = new BABYLON.StandardMaterial("water", scene);
  waterMaterial.diffuseTexture = new BABYLON.Texture("./public/textures/water.png", scene);
  // 
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
  widthTotalDistance = Math.abs(xmax - xmin);
  heightTotalDistance = Math.abs(zmax - zmin);
  tileWidth = widthTotalDistance / subdivisions.w;
  tileHeight = heightTotalDistance / subdivisions.h;
  // Odd/even flags
  widthIsOdd;
  if(subdivisions.w % 2 !== 0) {
      widthIsOdd = true;
  }
  else {
      widthIsOdd = false;
  }
  heightIsOdd;
  if(subdivisions.h % 2 !== 0) {
      heightIsOdd = true;
  }
  else {
      heightIsOdd = false;
  }

  // Need to determine coords first, all params necessary
  refreshMapObjects();
  // spawnAnimal(scene, mapTemplate, numTilesWidth, numTilesHeight);
  // Create cooldown for player actions
  var start = new Date();
  var highlightTile = null;

  function clearHighlightTile() {
    if(highlightTile !== null) {
      highlightTile.dispose();
      highlighted = false;
      gameGridX = null;
      gameGridZ = null;
    }
  }

  //When pointer down event is raised
  scene.onPointerDown = function (evt, pickResult) {
    // Get time in ms
    var elapsed = new Date() - start;
    console.log("Time passed: " + elapsed);
    // if the click hits the ground object and cooldown finished
    // if (pickResult.hit && (firstAction || elapsed >= plantActionCd)) {
    if (pickResult.hit) {
      firstAction = false;
      start = new Date();
      // z is the depth, which is basically our y
      x = pickResult.pickedPoint.x;
      z = pickResult.pickedPoint.z;
      console.log("World coords: (" + x + ", " + z + ")");
      // Begin converting to game grid
      gameGridX = getGameGridX(x);
      gameGridZ = getGameGridZ(z);
      
      console.log("Mapped game grid to array coords: (" + gameGridX + ", " + gameGridZ + ")");

      if(mapTemplate[gameGridZ][gameGridX] !== null) {
        var currentType = mapTemplate[gameGridZ][gameGridX].type;
        console.log("Player selected this tile: " + currentType);    
        if(currentType === 'ground') {
          // Highlight picked tile
          if(highlightTile !== null) {
            highlightTile.dispose();
            highlightTile = createHighlightTile(gameGridX, gameGridZ, scene);
          }
          else {
            highlightTile = createHighlightTile(gameGridX, gameGridZ, scene);
          }

          var currentPlant =  mapTemplate[gameGridZ][gameGridX].plant;
          if(currentPlant !== null) {
            console.log("This plant is here: " + currentPlant.type);
          }
          else {
            // Can make new plant
            // Need to update server array
            // socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': 'tree'});
          }
        }
        else {
          // Water tile selected
          clearHighlightTile()
        }            
      }
      else { // null tile selected
        clearHighlightTile()
      }
    }
    else { // nothing hit
      clearHighlightTile()
    }
  };

  renderGUI();

  // Buttons for player actions
  plantButton.onPointerDownObservable.add(function() {
    if(highlighted === true) {
      // Show plant panel
      plantPanel.isVisible = true;
      var plantType = "tree";
      socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': plantType});
    }
  });

  renderRain();

  return scene;
}

function renderGUI () {
  // GUI
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  gui_placename = new BABYLON.GUI.TextBlock();
  gui_placename.text = placeName.charAt(0).toUpperCase() + placeName.slice(1);
  gui_placename.color = "white";
  gui_placename.fontSize = 72;
  gui_placename.paddingLeft = 4;
  gui_placename.fontFamily = "Arial";
  advancedTexture.addControl(gui_placename);
  gui_placename.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_placename.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_weather = new BABYLON.GUI.TextBlock();
  gui_weather.text = (data.precip ? 'Bless the rain!': 'It is dry');
  gui_weather.color = "white";
  gui_weather.fontSize = 26;
  gui_weather.paddingTop = 72;
  gui_weather.paddingLeft = 8;
  gui_weather.fontFamily = "Arial";
  advancedTexture.addControl(gui_weather);
  gui_weather.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_weather.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_usercount = new BABYLON.GUI.TextBlock();
  gui_usercount.text = userCnt + ' user(s) on island';
  gui_usercount.color = "white";
  gui_usercount.paddingRight = 8;
  gui_usercount.paddingTop = 8;
  gui_usercount.fontSize = 32;
  gui_usercount.fontFamily = "Arial";
  advancedTexture.addControl(gui_usercount);
  gui_usercount.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  gui_usercount.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  // Planting 
  plantButton = BABYLON.GUI.Button.CreateImageOnlyButton("plantButton", "public/textures/button_planting.png");
  plantButton.width = "100px";
  plantButton.height = "110px";
  plantButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  plantButton.left = "-10%";
  plantButton.paddingBottom = "10px";
  plantButton.thickness = 0;
  advancedTexture.addControl(plantButton);  

  plantPanel = new BABYLON.GUI.StackPanel();    
  advancedTexture.addControl(plantPanel);   
  plantPanel.isVisible = false;

  treeButton = BABYLON.GUI.Button.CreateSimpleButton("treeButton", "Tree");
  treeButton.width = 0.2;
  treeButton.height = "40px";
  treeButton.color = "white";
  treeButton.background = "green";
  plantPanel.addControl(treeButton);     

  flowerButton = BABYLON.GUI.Button.CreateSimpleButton("flowerButton", "Flower");
  flowerButton.width = 0.2;
  flowerButton.height = "40px";
  flowerButton.color = "white";
  flowerButton.background = "green";
  plantPanel.addControl(flowerButton); 

  waterButton = BABYLON.GUI.Button.CreateImageOnlyButton("waterButton", "public/textures/button_watering.png");
  waterButton.width = "100px";
  waterButton.height = "110px";
  waterButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  waterButton.left = "10%";
  waterButton.paddingBottom = "10px";
  waterButton.thickness = 0;
  advancedTexture.addControl(waterButton);  
}


function renderRain () {
  var rainEmitter = BABYLON.Mesh.CreateBox("rainEmitter", 0.01, scene);
  rainEmitter.position.y = 10;

  rainParticleSystem = new BABYLON.ParticleSystem("rain", 1000, scene);

  rainParticleSystem.particleTexture = new BABYLON.Texture("public/textures/flare.png", scene);
  rainParticleSystem.emitter = rainEmitter;

  rainParticleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10); // Starting all From
  rainParticleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10); // To...

  rainParticleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  rainParticleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  rainParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

  rainParticleSystem.minSize = 0.1;
  rainParticleSystem.maxSize = 0.2;

  rainParticleSystem.minLifeTime = 0.2;
  rainParticleSystem.maxLifeTime = 0.3;

  rainParticleSystem.emitRate = 1500;

  rainParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  rainParticleSystem.gravity = new BABYLON.Vector3(0, -10, 0);
  rainParticleSystem.direction1 = new BABYLON.Vector3(0, -10, 0);
  rainParticleSystem.direction2 = new BABYLON.Vector3(0, -10, 0);

  rainParticleSystem.minEmitPower = 10;
  rainParticleSystem.maxEmitPower = 10;
  rainParticleSystem.updateSpeed = 0.005;

  // Begins updateWeather
  rainMusic = new BABYLON.Sound("RainMusic", "public/sounds/rain.mp3", scene, updateWeather, {'loop': true});
}

function updateWeather () {

  if (data.precip && !raining) { // Raining

    scene.clearColor = new BABYLON.Color3(0.2588, 0.5608, 0.9569);
    rainParticleSystem.start();
    rainMusic.play();
    for(var i = 0; i < lights.length; i++) {
      lights[i].diffuse = new BABYLON.Color3(0.7, 0.7, 0.7);
    }
  } else if (!data.precip && raining) { // Dry

    scene.clearColor = new BABYLON.Color3(0.4078, 0.8235, 0.9098);
    rainMusic.stop();
    rainParticleSystem.stop();
    for(var i = 0; i < lights.length; i++) {
      lights[i].diffuse = new BABYLON.Color3(1, 1, 1);
    }
  }

  raining = data.precip;
}

function startBabylon () {
  if (BABYLON.Engine.isSupported()) {

    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);

    engine.displayLoadingUI();
    scene = createScene();

    scene.executeWhenReady(function () {
      engine.hideLoadingUI();

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
