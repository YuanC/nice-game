const getter = require("pixel-getter")
const fs = require("fs")

/*
  Tool for converting an image into a grid to be used
*/
getter.get("map1.png", (err, pixels) => {

  if (err) {
    console.log(err)
    return
  }

  pixels = pixels[0]  
  console.log(pixels)

  let map = [], r = 0

  for (let i = 0; i < 900; i++) {
    if (i % 30 === 0) {
      map.push([])
      if (i != 0) {
        r++
      }
    }

    let tile = pixels[i]

    if (tile['r'] == 255) { // water
      map[r].push({'type': 'water'})

    } else if (tile['r'] == 0 && tile['a'] == 255) { // ground
      map[r].push({'type': 'ground', 'plant': null})
      
    } else {
      map[r].push(null)
    }
  } 

  fs.writeFileSync('map.json', JSON.stringify({'map': map}));

});