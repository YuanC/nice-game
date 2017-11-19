function spawnAnimal(mapTemplate, scene) {
	while(true) {
		// get a random coordinate (spawnpoint)
		var randomCoord = getRandomCoord();

		var xCoord = randomCoord.x;
		var zCoord = randomCoord.z;

		var col = getGameGridX(xCoord);
		var row = getGameGridZ(zCoord);
		console.log("Random game grid coord: (" + row + ", " + col + ")");
		console.log("Tile: ", mapTemplate[row][col]);
		// if the spawn point is a ground tile, spawn an animal
		if(mapTemplate[row][col] !== null) {
			if(mapTemplate[row][col].type === 'ground') {
				var animal = new BABYLON.Mesh.CreateBox("animal", 1, scene);
				animal.material = new BABYLON.StandardMaterial("animal", scene);
				animal.material.alpha = 0;
				var animalSprite = new BABYLON.Mesh.CreatePlane("animalSprite", 0, scene);
				animalSprite.material = new BABYLON.StandardMaterial("animalSprite", scene);
				animalSprite.material.diffuseTexture = new BABYLON.Texture("public/textures/rightdeer.png", scene);
				animalSprite.material.diffuseTexture.hasAlpha = true;
				animalSprite.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
				animalCreated = true;
				giveLife(animal, animalSprite, xCoord, zCoord);
				return animal;
			}
		}
	}
}

function giveLife(animal, animalSprite, xCoord, zCoord) {
	// Give pathing algorithm
	// Initial position
	animal.position = new BABYLON.Vector3(getObjCoordX(getGameGridX(xCoord)), 0.4, getObjCoordZ(getGameGridZ(zCoord)));

	animalSprite.position = animal.position;

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
		}
		if(i === count){
			count = Math.floor((Math.random() * (200-100)) + 100);
			i = 0;
			direction = (Math.floor(Math.random() * 4 + 1)) % 4;
		}
		animalSprite.position = animal.position;
	});
}

// Debugging
// setInterval(function(){console.log(animal.position)}, 200);

// get a random x,z coordinate for tile
function getRandomCoord () {
	var randomWidth = (Math.floor(Math.random() * widthTotalDistance)) - (widthTotalDistance / 2) ;
	var randomHeight =	(Math.floor(Math.random() * heightTotalDistance)) - (heightTotalDistance / 2);
	console.log("------ Random width: " + randomWidth + " Random height: " + randomHeight);
	var randomCoord = new BABYLON.Vector3(randomWidth, 0, randomHeight);
	return randomCoord;
}

