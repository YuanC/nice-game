// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 10, light;
var treeSize = 1.5;
var flowerSize = 0.5;
var shrubSize = 0.75;
var rainParticleSystem, rainMusic;
var sprinkleEmitter, sprinkleParticles;
var treeMatrix, mapTemplate;
var plantActionCd = 5000; // in milliseconds
var firstAction = true;
var bgMusic;

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
var highlightTile = null;
var start = new Date().getTime();
var elapsed;
var fontFamily = "Century Gothic";
var maxAnimalCount = 5;

// GUI Actions
var activePlantButton, inactivePlantButton, cooldownPlantButton;
var activeWaterButton, inactiveWaterButton, cooldownWaterButton;
var plantPanel;
var treeButton, flowerButton, shrubButton;

var plantTextures = {};

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

  initPlantTextures();

  // Create the Tiled Ground
  var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, scene);

  // Create the multi material, set textures
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("./public/textures/grass.png", scene);
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

  // Make some deer
  for(var i = 0; i < maxAnimalCount; i++) {
    var newAnimal = spawnAnimal(mapTemplate, scene);
  }
  
  //When pointer down event is raised
  scene.onPointerDown = function (evt, pickResult) {
    elapsed = new Date().getTime() - start;
    console.log(elapsed);
    
    // if the click hits the ground object and cooldown finished
    if (pickResult.hit && (firstAction || elapsed >= plantActionCd)) {
    // if (pickResult.hit) {
      
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
            inactivePlantButton.isVisible = false;
            inactiveWaterButton.isVisible = false;
            activePlantButton.isVisible = true;
            activeWaterButton.isVisible = true;
          }
          else {
            highlightTile = createHighlightTile(gameGridX, gameGridZ, scene);
            inactivePlantButton.isVisible = false;
            inactiveWaterButton.isVisible = false;
            activePlantButton.isVisible = true;
            activeWaterButton.isVisible = true;
          }

          var currentPlant =  mapTemplate[gameGridZ][gameGridX].plant;
          if(currentPlant !== null) {
            console.log("This plant is here: " + currentPlant.type);
          }
          else {
            // clearHighlightTile();
            // Can make new plant
            // Need to update server array
            // socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': 'tree'});
          }
        }
        else {
          // Water tile selected
          clearHighlightTile();
        }            
      }
      else { // null tile selected
        clearHighlightTile();
      }
    }
    else if(elapsed < plantActionCd) {
      inactivePlantButton.isVisible = true;
      inactiveWaterButton.isVisible = true;
    }
    else { // nothing hit
      clearHighlightTile();
    }
  };

  renderGUI();

  // Buttons for player actions
  activePlantButton.onPointerDownObservable.add(function() {
    elapsed = new Date().getTime() - start;
    if(highlighted === true && (elapsed >= plantActionCd || firstAction)) {
      console.log("Active plant button clicked")
      var plantType = null;
      // Show plant panel
      plantPanel.isVisible = true;
      treeButton.onPointerDownObservable.add(function() {
        plantType = "tree";
        socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': plantType});
        plantPanel.isVisible = false;
        resetActiveButtons();
        displayCd();
      });
      flowerButton.onPointerDownObservable.add(function() {
        plantType = "flower";
        socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': plantType});
        plantPanel.isVisible = false;
        resetActiveButtons();
        displayCd();
      });
      shrubButton.onPointerDownObservable.add(function() {
        plantType = "shrub";
        socket.emit('newPlant', {'pos': [gameGridZ, gameGridX], 'type': plantType});
        plantPanel.isVisible = false;
        resetActiveButtons();
        displayCd();

      });
    }
  });

  activeWaterButton.onPointerDownObservable.add(function() {
    elapsed = new Date().getTime() - start;
    if(highlighted === true && (elapsed >= plantActionCd || firstAction)) {
      if(mapTemplate[gameGridZ][gameGridX] !== null) {
        if(mapTemplate[gameGridZ][gameGridX].type === 'ground') {
          if(plantType = mapTemplate[gameGridZ][gameGridX].plant !== null) {
            socket.emit('waterPlant', [gameGridZ, gameGridX]);
            resetActiveButtons();
            displayCd();
            sprinkle(getObjCoordX(gameGridX), getObjCoordZ(gameGridZ));
          }
        }
      }
    }
  });

  renderRain();

  renderSprinkle();

  bgMusic = new BABYLON.Sound("RainMusic", "public/sounds/bg.mp3", scene, updateWeather, {'loop': true, 'autoplay': true, 'volume': 0.3});

  // Some Camera Effects
  // var parameters = {  };
  // var lensEffect = new BABYLON.LensRenderingPipeline('lensEffects', parameters, scene, 1.0, camera);

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
  gui_placename.fontFamily = fontFamily;
  advancedTexture.addControl(gui_placename);
  gui_placename.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_placename.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_weather = new BABYLON.GUI.TextBlock();
  gui_weather.text = (data.precip ? 'Bless the rain!': 'It is dry');
  gui_weather.color = "white";
  gui_weather.fontSize = 26;
  gui_weather.paddingTop = 72;
  gui_weather.paddingLeft = 8;
  gui_weather.fontFamily = fontFamily;
  advancedTexture.addControl(gui_weather);
  gui_weather.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_weather.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_usercount = new BABYLON.GUI.TextBlock();
  gui_usercount.text = userCnt + ' user(s) on island';
  gui_usercount.color = "white";
  gui_usercount.paddingRight = 8;
  gui_usercount.paddingTop = 8;
  gui_usercount.fontSize = 32;
  gui_usercount.fontFamily = fontFamily;
  advancedTexture.addControl(gui_usercount);
  gui_usercount.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  gui_usercount.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  // Logo
  var logo = new BABYLON.GUI.Image("logo", "public/textures/logo.png");
  logo.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  logo.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
  logo.height = "100px";
  logo.paddingTop = "10px";
  advancedTexture.addControl(logo); 

  // Planting 
  inactivePlantButton = BABYLON.GUI.Button.CreateImageOnlyButton("inactivePlantButton", "public/textures/planting_inactive.png");
  inactivePlantButton.width = "100px";
  inactivePlantButton.height = "110px";
  inactivePlantButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  inactivePlantButton.left = "-10%";
  inactivePlantButton.paddingBottom = "10px";
  inactivePlantButton.thickness = 0;
  inactivePlantButton.isVisible = true;
  advancedTexture.addControl(inactivePlantButton);  

  activePlantButton = BABYLON.GUI.Button.CreateImageOnlyButton("activePlantButton", "public/textures/planting_active.png");
  activePlantButton.width = "100px";
  activePlantButton.height = "110px";
  activePlantButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  activePlantButton.left = "-10%";
  activePlantButton.paddingBottom = "10px";
  activePlantButton.thickness = 0;
  activePlantButton.isVisible = false;
  advancedTexture.addControl(activePlantButton);  

  inactiveWaterButton = BABYLON.GUI.Button.CreateImageOnlyButton("inactiveWaterButton", "public/textures/watering_inactive.png");
  inactiveWaterButton.width = "100px";
  inactiveWaterButton.height = "110px";
  inactiveWaterButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  inactiveWaterButton.left = "10%";
  inactiveWaterButton.paddingBottom = "10px";
  inactiveWaterButton.thickness = 0;
  inactiveWaterButton.isVisible = true;
  advancedTexture.addControl(inactiveWaterButton);  

  activeWaterButton = BABYLON.GUI.Button.CreateImageOnlyButton("activeWaterButton", "public/textures/watering_active.png");
  activeWaterButton.width = "100px";
  activeWaterButton.height = "110px";
  activeWaterButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  activeWaterButton.left = "10%";
  activeWaterButton.paddingBottom = "10px";
  activeWaterButton.thickness = 0;
  activeWaterButton.isVisible = false;
  advancedTexture.addControl(activeWaterButton);  
  
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

  shrubButton = BABYLON.GUI.Button.CreateSimpleButton("shrubButton", "Shrub");
  shrubButton.width = 0.2;
  shrubButton.height = "40px";
  shrubButton.color = "white";
  shrubButton.background = "green";
  plantPanel.addControl(shrubButton); 

}


function renderRain () {
  var rainEmitter = BABYLON.Mesh.CreateBox("rainEmitter", 0.01, scene);
  rainEmitter.position.y = 10;

  rainParticleSystem = new BABYLON.ParticleSystem("rain", 1500, scene);

  rainParticleSystem.particleTexture = new BABYLON.Texture("public/textures/flare.png", scene);
  rainParticleSystem.emitter = rainEmitter;

  rainParticleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20); // Starting all From
  rainParticleSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20); // To...

  rainParticleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  rainParticleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  rainParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

  rainParticleSystem.minSize = 0.1;
  rainParticleSystem.maxSize = 0.2;

  rainParticleSystem.minLifeTime = 0.05;
  rainParticleSystem.maxLifeTime = 0.1;

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

function renderSprinkle () {
  sprinkleEmitter = BABYLON.Mesh.CreateBox("sprinkleEmitter", 0.01, scene);
  sprinkleEmitter.position.y = 2;
  sprinkleParticles = new BABYLON.ParticleSystem("sprinkle", 50, scene);

  sprinkleParticles.particleTexture = new BABYLON.Texture("public/textures/flare.png", scene);
  sprinkleParticles.emitter = sprinkleEmitter;

  sprinkleParticles.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
  sprinkleParticles.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);

  sprinkleParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  sprinkleParticles.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  sprinkleParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

  sprinkleParticles.minSize = 0.3;
  sprinkleParticles.maxSize = 0.5;

  sprinkleParticles.minLifeTime = 0.2;
  sprinkleParticles.maxLifeTime = 0.3;

  sprinkleParticles.emitRate = 50;
  sprinkleParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  sprinkleParticles.gravity = new BABYLON.Vector3(0, -20, 0);
  sprinkleParticles.direction1 = new BABYLON.Vector3(0, -1, 0);
  sprinkleParticles.direction2 = new BABYLON.Vector3(0, -1, 0);

}

function sprinkle (x, z) {
  sprinkleEmitter.position.x = x;
  sprinkleEmitter.position.z = z;

  sprinkleParticles.start();
  setTimeout(function () { sprinkleParticles.stop(); }, 1000);

}

function updateWeather () {

  if (data.precip && !raining) { // Raining
    
    console.log('change to rain');

    scene.clearColor = new BABYLON.Color3(0.2588, 0.5608, 0.9569);
    rainParticleSystem.start();
    rainMusic.play();
    for(var i = 0; i < lights.length; i++) {
      lights[i].diffuse = new BABYLON.Color3(0.7, 0.7, 0.7);
    }

  } else if (!data.precip && raining) { // Dry

    console.log('change to dry');

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
    engine.loadingUIText = "Bloom is loading...";
    engine.loadingUIBackgroundColor = "green";

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
