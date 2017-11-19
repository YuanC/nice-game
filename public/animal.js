var animalCount = 0;
var animal;

function spawnAnimal(scene, mapTemplate) {
	// only create one animal
	while(animalCount < 1){
		// get a random coordinate (spawnpoint)
		var randomCoord = getRandomCoord();
		console.log("random coord: ", randomCoord);

		var xCoord = randomCoord.x;
		console.log(xCoord);

		var zCoord = randomCoord.z;
		console.log(zCoord);

		var gameGridX = getGameGridX(xCoord);
		console.log(gameGridX);

		var gameGridZ = getGameGridZ(zCoord);
		console.log(gameGridZ);

		var randomTile = mapTemplate[gameGridZ][gameGridX];
		console.log("tile: ", randomTile);

		// if the spawn point is a ground tile, spawn an animal
		if (randomTile !== null && randomTile.type === 'ground'){
			animal = new BABYLON.Mesh.CreateBox("animal", 1, scene);
			console.log("I SPAWNED BOY");
			// place the animal at the random tile
			// animal.position = new BABYLON.Vector3(xCoord, 0, zCoord);
			animalCount++;
		}
	}
	animal.position = new BABYLON.Vector3(getObjCoordX(getGameGridX(xCoord)), 0, getObjCoordZ(getGameGridZ(zCoord)));
	console.log("placed at ", getObjCoordX(getGameGridX(xCoord)), getObjCoordZ(getGameGridZ(zCoord)));
}

// function createAnimal (mapTemplate, gameGridX, gameGridZ) {
// 	//only spawn an animal on the ground and if there isn't one on the screen already
// 	if(mapTemplate[gameGridZ][gameGridX] !== null && mapTemplate[gameGridZ][gameGridX].type === 'ground' && animalCount < 1){
// 		var animal = new BABYLON.StandardMaterial("red", scene);
// 	}
// }

// get a random x,z coordinate for tile
function getRandomCoord () {
	var randomCoord = new BABYLON.Vector3((Math.floor(Math.random() * 15)), 0, (Math.floor(Math.random() * 15)));
	return randomCoord;
}

