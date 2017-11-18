// debug tools
var canvas, engine, scene;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // Create a rotating camera
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = 5;
    camera.orthoBottom = -5;
    camera.orthoLeft = -5;
    camera.orthoRight = 5;

    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach it to handle user inputs (keyboard, mouse, touch)
    camera.attachControl(canvas, true);
    
    // Add a light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tiled Ground Tutorial
    
    // Part 1 : Creation of Tiled Ground
    // Parameters: length and width must be pos. integers
    var length = 3;
    var height = 3;
    var xmin = length * -1;
    var zmin = height * -1;
    var xmax = length;
    var zmax = height;
    var precision = {
        "w" : 1,
        "h" : 1
    };
    // Actual number of tiles
    var subdivisions = {
        'h' : 5, // corresponds to z axis
        'w' : 5  // corresponds to x axis
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
    
    // Create Multi Material, position here matters, corresponds to index
    var multimat = new BABYLON.MultiMaterial("multi", scene);
    multimat.subMaterials.push(greenMaterial);
    multimat.subMaterials.push(blueMaterial);
    multimat.subMaterials.push(greyMaterial);    

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
            if(row % 2 === 0 || col % 2 === 1) {
                // Push green material (index 0)
                tiledGround.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, base , tileIndicesLength, tiledGround));
                base += tileIndicesLength;
            }
            else {
                // Else push blue material
                tiledGround.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, base , tileIndicesLength, tiledGround));
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
                gameGridZ -= Math.floor(subdivisions.h / 2);
            }
            else {
                gameGridZ -= Math.floor(subdivisions.h / 2);
            }
            // Convert to positve
            gameGridX = Math.abs(gameGridX);
            gameGridZ = Math.abs(gameGridZ);
            console.log("Mapped game grid to array coords: (" + gameGridX + ", " + gameGridZ + ")");
        }
    };

    return scene;
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

        // TODO: Request update from server
        // socket update => callback update
      });
    });

    window.addEventListener("resize", function () {
      engine.resize();
    });
  } else {
      alert("Sorry! Your browser isn't supported :(");
  }
}