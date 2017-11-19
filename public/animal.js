function spawnAnimal(scene, mapTemplate, numTilesWidth, numTilesHeight) {
	var animalCount = 0;
	var animal;
	// only create one animal
	while(animalCount < 1){
		// get a random array index (spawn point)
		var randomTile = getRandomTile(mapTemplate, numTilesWidth, numTilesHeight);
		// if the spawn point is a ground tile, spawn an animal
		if (randomTile !== null && randomTile.type === 'ground'){
			animal = new BABYLON.Mesh.CreateBox("animal", 1, scene);
			animalCount++;
		}
	}
}

// function createAnimal (mapTemplate, gameGridX, gameGridZ) {
// 	//only spawn an animal on the ground and if there isn't one on the screen already
// 	if(mapTemplate[gameGridZ][gameGridX] !== null && mapTemplate[gameGridZ][gameGridX].type === 'ground' && animalCount < 1){
// 		var animal = new BABYLON.StandardMaterial("red", scene);
// 	}
// }

function getRandomTile (mapTemplate, numTilesWidth, numTilesHeight) {
	
	var randomTile = mapTemplate[Math.floor((Math.random() * 30) + 1) % numTilesWidth][Math.floor((Math.random() * 30) + 1) % numTilesHeight];

	return randomTile;
}

// function moveAnimal(dest, animal) {
// 	if(animal)
// }