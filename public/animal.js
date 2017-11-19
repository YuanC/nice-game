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
	//initial position
	animal.position = new BABYLON.Vector3(getObjCoordX(getGameGridX(xCoord)), 0, getObjCoordZ(getGameGridZ(zCoord)));
	
	var currentX = animal.position.x;

	var currentZ = animal.position.z;

	let direction = 1;
	
	var i = 0;
	var count = Math.floor((Math.random() * (200-100)) + 100);

	scene.registerAfterRender(function(){

    	if(direction === 1){
    		animal.locallyTranslate(new BABYLON.Vector3(Math.random() * 0.02, 0, Math.random()* 0.02));
 		}
 		if(direction === 2){
    		animal.locallyTranslate(new BABYLON.Vector3(Math.random() * 0.02, 0, Math.random()* -0.02));

 		}
 		if(direction === 3){
    		animal.locallyTranslate(new BABYLON.Vector3(Math.random() * -0.02, 0, Math.random()* -0.02));

 		}
 		if(direction === 4){
    		animal.locallyTranslate(new BABYLON.Vector3(Math.random() * -0.02, 0, Math.random()* 0.02));

 		}
 		currentX = animal.position.x;
		currentZ = animal.position.z;
		i++;
 		if(mapTemplate[getGameGridZ(currentZ)][getGameGridX(currentX + 1)].type === 'water' || 
 			mapTemplate[getGameGridZ(currentZ)][getGameGridX(currentX - 1)].type === 'water'|| 
 			mapTemplate[getGameGridZ(currentZ + 1)][getGameGridX(currentX)].type === 'water' || 
 			mapTemplate[getGameGridZ(currentZ - 1)][getGameGridX(currentX)].type === 'water') {
 			direction = (direction + 2) % 4;
 			if(direction === 0){
 				direction = 4;
 			}
 			for(var j = 0; j < 50; j++){
 				if(direction === 1){
    				animal.locallyTranslate(new BABYLON.Vector3(Math.random() * 0.008, 0, Math.random()* 0.008));
 				}
 				if(direction === 2){
    				animal.locallyTranslate(new BABYLON.Vector3(Math.random() * 0.008, 0, Math.random()* -0.008));

 				}
 				if(direction === 3){
    				animal.locallyTranslate(new BABYLON.Vector3(Math.random() * -0.008, 0, Math.random()* -0.008));

 				}
 				if(direction === 4){
    				animal.locallyTranslate(new BABYLON.Vector3(Math.random() * -0.008, 0, Math.random()* 0.008));

 				}
 			}
 			

 			console.log("look i changed direction lol", direction);
 		}
 		if(i === count){
 			count = Math.floor((Math.random() * (200-100)) + 100);
 			i = 0;
 			direction = (Math.floor(Math.random() * 4 + 1)) % 4;

 		}
   //  	else{
			// animal.locallyTranslate(new BABYLON.Vector3(Math.random() * 0.02 * -1, 0, Math.random()* 0.02 * -1));
			// currentX = animal.position.x;
			// currentZ = animal.position.z;
   //  	}
    	
  	});

	// var animalTile = mapTemplate[animal.position.z][animal.position.x];
	// console.log(animalTile);
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

