var adjacents = {'W': [-1, 0], 'S': [0, -1], 'N': [0, 1], 'E': [1, 0]};

function spawnAnimal(mapTemplate, scene) {
	while(true) {
		// get a random coordinate (spawnpoint)
		var randomCoord = getRandomCoord();

		var xCoord = randomCoord.x;
		var zCoord = randomCoord.z;

		var col = getGameGridX(xCoord);
		var row = getGameGridZ(zCoord);
		// console.log("Random game grid coord: (" + row + ", " + col + ")");
		// console.log("Tile: ", mapTemplate[row][col]);
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

	var next = chooseLocation(getGameGridX(xCoord), getGameGridZ(zCoord));
	// console.log(next);
	if (next) {
		animal.next = next.pos;
		animal.dir = next.dir;
	}

	scene.registerAfterRender(function() {

		var animalSpeed = 0.02;

		// move
		animal.locallyTranslate(
			new BABYLON.Vector3(
				adjacents[animal.dir][0] * animalSpeed, 0, adjacents[animal.dir][1] * animalSpeed
			)
		);

		var curr_x = animal.position.x;
		var curr_z = animal.position.z;

		var tar_x = getObjCoordX(animal.next[0]);
		var tar_z = getObjCoordZ(animal.next[1]);

		var diff_x = tar_x - curr_x;
		var diff_z = tar_z - curr_z;

		// destination detection
		if (animal.dir === 'N' && diff_z < 0) {

			var curr_pos = animal.next;
			var next = chooseLocation(curr_pos[0], curr_pos[1]);
			if (next) {
				animal.next = next.pos;
				animal.dir = next.dir;
			}

		} else if (animal.dir === 'S' && diff_z > 0) {

			var curr_pos = animal.next;
			var next = chooseLocation(curr_pos[0], curr_pos[1]);
			if (next) {
				animal.next = next.pos;
				animal.dir = next.dir;
			}

		} else if (animal.dir === 'W' && diff_x > 0) {

			var curr_pos = animal.next;
			var next = chooseLocation(curr_pos[0], curr_pos[1]);
			if (next) {
				animal.next = next.pos;
				animal.dir = next.dir;
			}

		} else if (animal.dir === 'E' && diff_x < 0) {

			var curr_pos = animal.next;
			var next = chooseLocation(curr_pos[0], curr_pos[1]);
			if (next) {
				animal.next = next.pos;
				animal.dir = next.dir;
			}
		}

		animalSprite.position = animal.position;
	});
}

function chooseLocation (x, z) {

	var possible = [];

	for (adj in adjacents) {
		var temp_x = x + adjacents[adj][0];
		var temp_z = z + adjacents[adj][1];

		if (temp_x >= 0 && temp_x < numTilesWidth 
			&& temp_z >= 0 && temp_z < numTilesHeight) {
			
			var tile = mapTemplate[temp_z][temp_x];

			if (tile && tile['type'] == 'ground') {
				possible.push(adj);
			}
		}
	}

	// console.log(possible);
	if (!possible.length) {
		return null;
	}

	var i = Math.floor(Math.random()*possible.length);

	var dir = possible[i];
	var pos = adjacents[dir];

	// row, col of mapTemplate
	var next_x = x + pos[0]; 
	var next_z = z + pos[1];

	return {'dir': dir, 'pos': [next_x, next_z]}
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

