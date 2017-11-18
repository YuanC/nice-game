// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather;

function createScene () { // Initialize scene
  
  scene = new BABYLON.Scene(engine);
  // scene.debugLayer.show();

  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoTop = 5;
  camera.orthoBottom = -5;
  camera.orthoLeft = -5;
  camera.orthoRight = 5;
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

  var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
  sphere.position.y = 1;

  var ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 1.5, width: 2.5, subdivisions: 900}, scene);

  // GUI
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  var gui_placeneame = new BABYLON.GUI.TextBlock();
  gui_placeneame.text = placeName.charAt(0).toUpperCase() + placeName.slice(1);
  gui_placeneame.color = "white";
  gui_placeneame.fontSize = 72;
  gui_placeneame.fontFamily = "Arial";
  advancedTexture.addControl(gui_placeneame);
  gui_placeneame.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_placeneame.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

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