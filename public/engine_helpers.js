
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
function getObjCoordX(gameGridX) {
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

function getObjCoordZ(gameGridZ) {
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


function plant(col, row, type) {
  if(type === 'tree') {
    treeMatrix[row][col] = createTree(col, row, treeSize, scene);
  }
  else if(type === 'flower') {
    treeMatrix[row][col] = createFlower(col, row, flowerSize, scene);
  }
  else if(type === 'shrub') {
    treeMatrix[row][col] = createShrub(col, row, shrubSize, scene);
  }
  else {
    // type does not exist
    console.log("That plant type does not exist...")
  }
}

function refreshMapObjects() {
  
  if (!treeMatrix) {
    treeMatrix = [];
    for (var row = 0; row < subdivisions.h; row++) {
      treeMatrix.push([]);
      for (var col = 0; col < subdivisions.w; col++) {
        treeMatrix[row].push(null);
      }
    }
  }

  console.log("--- Refreshing map objects...");

  for (var row = 0; row < subdivisions.h; row++) {
    for (var col = 0; col < subdivisions.w; col++) {

      if(mapTemplate[row][col] != null 
        && mapTemplate[row][col].type === 'ground') {

        var currentPlant =  mapTemplate[row][col].plant;

        if(currentPlant != null) {
          if (!treeMatrix[row][col]) { // Change Material
            plant(col, row, currentPlant.type);
          }
          if (currentPlant['stage'] === 0) {

            treeMatrix[row][col]['material']['diffuseTexture'] = plantTextures['sprout'];
            treeMatrix[row][col]['material']['diffuseTexture']['hasAlpha'] = true;

          } else if (currentPlant['stage'] >= 1) {

            treeMatrix[row][col]['material']['diffuseTexture'] = plantTextures[currentPlant['type']];
            treeMatrix[row][col]['material']['diffuseTexture']['hasAlpha'] = true;

          }

        } else if (treeMatrix[row][col]) { // delete plant
          treeMatrix[row][col].dispose();
          if(treeMatrix[row][col].progressBar !== null) {
            treeMatrix[row][col].progressBar.dispose();
          }
        }
      }
    }
  }
}

function refreshMapTile (pos, tile) {
  var row = pos[0];
  var col = pos[1];

  mapTemplate[row][col] = tile;

  if(mapTemplate[row][col] !== null 
    && mapTemplate[row][col].type === 'ground') {

    var currentPlant =  mapTemplate[row][col].plant;

    if(currentPlant != null) {

      if (!treeMatrix[row][col]) { // Change Material
        plant(col, row, currentPlant.type);
      }
      if (currentPlant['stage'] === 0) {

        treeMatrix[row][col]['material']['diffuseTexture'] = plantTextures['sprout'];
        treeMatrix[row][col]['material']['diffuseTexture']['hasAlpha'] = true;

      } else if (currentPlant['stage'] >= 1) {

        treeMatrix[row][col]['material']['diffuseTexture'] = plantTextures[currentPlant['type']];
        treeMatrix[row][col]['material']['diffuseTexture']['hasAlpha'] = true;

      }

    } else if (treeMatrix[row][col]) { // delete plant
      treeMatrix[row][col].dispose();
      if(treeMatrix[row][col].progressBar !== null) {
        treeMatrix[row][col].progressBar.dispose();
      }
    }
  }
}

// Map to array indices
function getGameGridX(x) {
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
function getGameGridZ(z) {
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

function initPlantTextures () {
  // plantTextures['flower'] = new BABYLON.StandardMaterial("flower", scene);
  plantTextures['flower'] = new BABYLON.Texture("./public/textures/flower.png", scene);
  plantTextures['flower'].hasAlpha = true;

  // plantTextures['tree'] = new BABYLON.StandardMaterial("tree", scene);
  plantTextures['tree'] = new BABYLON.Texture("./public/textures/tree.png", scene);
  plantTextures['tree'].hasAlpha = true;

  // plantTextures['shrub'] = new BABYLON.StandardMaterial("shrub", scene);
  plantTextures['shrub'] = new BABYLON.Texture("./public/textures/bush.png", scene);
  plantTextures['shrub'].hasAlpha = true;

  // plantTextures['sprout'] = new BABYLON.StandardMaterial("sprout", scene);
  plantTextures['sprout'] = new BABYLON.Texture("./public/textures/sapling.png", scene);
  plantTextures['sprout'].hasAlpha = true;
}

function createTree(gameGridX, gameGridZ, size, scene) {
  var plane = BABYLON.Mesh.CreatePlane("", size, scene);
  plane.material = new BABYLON.StandardMaterial("tree", scene);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  var objCoordX = getObjCoordX(gameGridX);
  var objCoordZ = getObjCoordZ(gameGridZ);                        
  plane.position.x = objCoordX;
  plane.position.z = objCoordZ;
  plane.position.y = size / 2;

  plane.isPickable = true; 

  plane.actionManager = new BABYLON.ActionManager(scene);
  
  var progressBar = null;
  plane.progressBar = progressBar;
  
  //ON MOUSE ENTER
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){ 
    plane.material.emissiveColor = BABYLON.Color3.White();
    progressBar = showProgress(gameGridX, gameGridZ, treeSize, scene);
    plane.progressBar = progressBar;
  }));
  
  //ON MOUSE EXIT
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
    // Get rid of color
    plane.material.emissiveColor = new BABYLON.Color3(0,0,0);
    plane.progressBar.dispose();
  }));

  return plane;
}

function createFlower(gameGridX, gameGridZ, size, scene) {
  var plane = BABYLON.Mesh.CreatePlane("", size, scene);
  plane.material = new BABYLON.StandardMaterial("flower", scene);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  var objCoordX = getObjCoordX(gameGridX);
  var objCoordZ = getObjCoordZ(gameGridZ);                        
  plane.position.x = objCoordX;
  plane.position.z = objCoordZ;
  plane.position.y = size / 2;

  plane.isPickable = true; 

  plane.actionManager = new BABYLON.ActionManager(scene);
  
  var progressBar = null;
  plane.progressBar = progressBar;
  
  //ON MOUSE ENTER
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){ 
    plane.material.emissiveColor = BABYLON.Color3.Black();
    progressBar = showProgress(gameGridX, gameGridZ, treeSize, scene);
    plane.progressBar = progressBar;
  }));
  
  //ON MOUSE EXIT
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
    plane.material.emissiveColor = new BABYLON.Color3(0,0,0);
    plane.progressBar.dispose();
  }));

  return plane;
}

function createShrub(gameGridX, gameGridZ, size, scene) {
  var plane = BABYLON.Mesh.CreatePlane("", size, scene);
  plane.material =  new BABYLON.StandardMaterial("shrub", scene);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  var objCoordX = getObjCoordX(gameGridX);  
  var objCoordZ = getObjCoordZ(gameGridZ);                        
  plane.position.x = objCoordX;
  plane.position.z = objCoordZ;
  plane.position.y = size / 2;

  plane.isPickable = true; 

  plane.actionManager = new BABYLON.ActionManager(scene);
  
  var progressBar = null;
  plane.progressBar = progressBar;
  
  //ON MOUSE ENTER
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){ 
    plane.material.emissiveColor = BABYLON.Color3.White();
    progressBar = showProgress(gameGridX, gameGridZ, treeSize, scene);
    plane.progressBar = progressBar;
  }));
  
  //ON MOUSE EXIT
  plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
    plane.material.emissiveColor = new BABYLON.Color3(0,0,0);
    plane.progressBar.dispose();
  }));

  return plane;
}

function showProgress(gameGridX, gameGridZ, size, scene) {
  // Create plane object
  var progressBar = BABYLON.Mesh.CreatePlane("", size, scene);

  // Create texture for text
  var progressTexture = new BABYLON.DynamicTexture("progressTexture", 256, scene, true);

  // Create material for plane
  var progressMaterial = new BABYLON.StandardMaterial("progressMaterial", scene);
  progressMaterial.opacityTexture = progressTexture;
  progressMaterial.diffuseTexture = progressTexture;
  progressBar.material = progressMaterial;

  // Set billboard
  progressBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  // Set coordinates
  var objCoordX = getObjCoordX(gameGridX);
  var objCoordZ = getObjCoordZ(gameGridZ);                       
  progressBar.position.x = objCoordX;
  progressBar.position.z = objCoordZ;
  progressBar.position.y = size * 1.5;

  // Display text
  var font = "bold 70px Segoe UI";
  var invertY = true;
  var progress = mapTemplate[gameGridZ][gameGridX].plant.progress;
  var stage = mapTemplate[gameGridZ][gameGridX].plant.stage;
  var text = stage + ", " + progress + '%';
  var color = "white"
  var x = 10;
  var y = 100;
  
  progressTexture.drawText(text, x, y, font, color, "transparent");

  return progressBar;
}

function createHighlightTile(gameGridX, gameGridZ, scene) {
  var objCoordX = getObjCoordX(gameGridX);
  var objCoordZ = getObjCoordZ(gameGridZ);

  var highlightTile = BABYLON.MeshBuilder.CreateGround("highlightTile", {width: tileWidth, height: tileHeight, subdivsions: 1}, scene);
  var highlightMaterial = new BABYLON.StandardMaterial("highlight", scene);
  highlightMaterial.emissiveColor = new BABYLON.Color3.White();
  highlightMaterial.alpha = 0.2;
  highlightTile.material = highlightMaterial;
  highlightTile.position.x = objCoordX;
  highlightTile.position.z = objCoordZ;
  highlightTile.position.y = 0.1; // slightly above ground
  highlightTile.isPickable = true; 

  highlighted = true;

  plantButton.isVisible = true;
  waterButton.isVisible = true;

  return highlightTile;
}