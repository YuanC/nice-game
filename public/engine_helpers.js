
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

          if (treeMatrix[row][col]) { // Update current plant mesh
            treeMatrix[row][col].dispose();
          }
          
          var objCoordX = getObjCoordX(widthIsOdd, col, tileWidth, numTilesWidth);
          var objCoordZ = getObjCoordZ(heightIsOdd, row, tileHeight, numTilesHeight);
          treeMatrix[row][col] = createTree(objCoordX, objCoordZ, treeSize, scene);

        } else if (treeMatrix[row][col]) { // delete plant
          treeMatrix[row][col].dispose();
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

function createTree(x, z, size, scene) {
  var greenBox = BABYLON.Mesh.CreateBox("greenBox", size, scene);
  var greenMat = new BABYLON.StandardMaterial("ground", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  greenMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  greenMat.emissiveColor = BABYLON.Color3.Green();
  greenBox.material = greenMat;
  console.log("New object game coord: (" + x + ", " + z + ")");                            
  greenBox.position.x = x;
  greenBox.position.z = z;

  return greenBox;
}