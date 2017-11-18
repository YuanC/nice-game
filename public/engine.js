// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 5;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

  camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  var wh_ratio = window.innerWidth/window.innerHeight;
  camera.orthoTop = cam_height;
  camera.orthoBottom = -cam_height;
  camera.orthoLeft = -wh_ratio*cam_height;  
  camera.orthoRight = wh_ratio*cam_height; 
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach it to handle user inputs (keyboard, mouse, touch)
    camera.attachControl(canvas, true);
    
    // Add a light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tiled Ground Tutorial
    
    // Part 1 : Creation of Tiled Ground
    // Parameters: length and width must be pos. integers
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

    // Template map (odd)
    // var mapTemplate = [
    //     [null, null, null, null, null],
    //     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
    //     [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
    //     [{'type': 'water'}, {'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
    //     [null, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
    // ]
    // Template map (even)
    // var mapTemplate = [
    //     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, {'type': 'water'}],
    //     [{'type': 'ground', 'plant': {'type': 'tree', 'progress': 3, 'stage': 1}}, {'type': 'ground', 'plant': null}, {'type': 'ground', 'plant': null}, {'type': 'water'}],
    //     [{'type': 'water'}, {'type': 'ground', 'plant': {'type': 'tree', 'progress': 2, 'stage': 0}}, {'type': 'water'}, {'type': 'water'}],
    //     [{'type': 'water'}, {'type': 'water'}, {'type': 'water'}, null]
    // ]
    var mapTemplate = data.map;

    // Process map template tile length and width
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

    // Part 2 : Create the multi material
    // Create differents materials
    // Lawn green rgb(124,252,0)
    var greenMaterial = new BABYLON.StandardMaterial("Green", scene);
    greenMaterial.diffuseColor = new BABYLON.Color3(124, 252, 0);
    // Deep sky blue rgb(0,191,255)
    var blueMaterial = new BABYLON.StandardMaterial("Blue", scene);
    blueMaterial.diffuseColor = new BABYLON.Color3(0, 191, 255);
    // Grey rgb(220,220,220)
    var greyMaterial = new BABYLON.StandardMaterial("Grey", scene);
    greyMaterial.diffuseColor = new BABYLON.Color3(220, 220, 220);
    // Null material
    var nullMaterial = new BABYLON.StandardMaterial("Null", scene);
    nullMaterial.alpha = 0.0;
    
    
    // Create Multi Material, position here matters, corresponds to index
    var multimat = new BABYLON.MultiMaterial("multi", scene);
    multimat.subMaterials.push(greenMaterial); //0
    multimat.subMaterials.push(blueMaterial); //1
    multimat.subMaterials.push(greyMaterial); //2
    multimat.subMaterials.push(nullMaterial); //3

    // Part 3 : Apply the multi material
    // Define multimat as material of the tiled ground
    tiledGround.material = multimat;
   
    // Needed variables to set subMeshes
    var verticesCount = tiledGround.getTotalVertices();
    var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);
    
    // Set subMeshes of the tiled ground
    tiledGround.subMeshes = [];
    var base = 0;
    for (var row = 0; row < subdivisions.h; row++) {
        for (var col = 0; col < subdivisions.w; col++) {
            // Make shitty little island
            if(mapTemplate[row][col] === null) {
                // Push green material (index 0)
                tiledGround.subMeshes.push(new BABYLON.SubMesh(3, 0, verticesCount, base , tileIndicesLength, tiledGround));                
                base += tileIndicesLength;
            }
            else if(mapTemplate[row][col].type === 'ground') {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, base , tileIndicesLength, tiledGround));
                base += tileIndicesLength;                
            }
            else if(mapTemplate[row][col].type === 'water') {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, base , tileIndicesLength, tiledGround));                                
                base += tileIndicesLength;                
            }
            else {
                // What type is this? Error, show grey
                console.log("Map tile type invalid");
                tiledGround.subMeshes.push(new BABYLON.SubMesh(3, 0, verticesCount, base , tileIndicesLength, tiledGround));                                
                base += tileIndicesLength;
            }
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    
    //When pointer down event is raised
    scene.onPointerDown = function (evt, pickResult) {
        // if the click hits the ground object, we change the impact position
        if (pickResult.hit) {
            // Tiled ground is the mesh
            // z is the depth, which is basically our y
            x = pickResult.pickedPoint.x;
            z = pickResult.pickedPoint.z;
            console.log("World coords: (" + x + ", " + z + ")");
            // Begin converting to game grid
            gameGridX = 0;
            gameGridZ = 0;
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
            
            console.log("Unmapped game grid coords: (" + gameGridX + ", " + gameGridZ + ")");
            // Map to array indices
            // For odd
            if(widthIsOdd === true) {
                gameGridX += Math.floor(subdivisions.w / 2);
            }
            else {
                gameGridX += Math.floor(subdivisions.w / 2) - 1;
            }
            if(heightIsOdd === true) {
                gameGridZ += Math.floor(subdivisions.h / 2);
            }
            else {
                gameGridZ += Math.floor(subdivisions.h / 2) - 1;
            }
            // Convert to positve
            gameGridX = Math.abs(gameGridX);
            gameGridZ = Math.abs(gameGridZ);
            // Get world coords now
            // Start at first tile (0,0), get midpoint of side lengths 
            // Have to account for odd tiles again...
            var objCoordX = 0;
            var objCoordZ = 0;
            if(widthIsOdd === true) {
                // Map to 0
                objCoordX -= tileWidth * Math.floor(numTilesWidth / 2);
                objCoordX += gameGridX * tileWidth;
            }
            else {
                objCoordX -= tileWidth / 2 + (tileWidth * Math.floor(numTilesWidth / 2));
                objCoordX += (gameGridX + 1) * tileWidth;                
            }
            if(heightIsOdd === true) {
                objCoordZ -= (tileHeight * Math.floor(numTilesHeight / 2));
                objCoordZ += gameGridZ * tileHeight;
            }
            else {
                objCoordZ -= tileHeight / 2 + (tileHeight * Math.floor(numTilesHeight / 2));
                objCoordZ += (gameGridZ + 1) * tileHeight;
            }
            // var objCoordX = tileWidth / 2 + (gameGridX * tileWidth);
            // var objCoordZ = tileHeight / 2 + (gameGridZ * tileHeight);
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