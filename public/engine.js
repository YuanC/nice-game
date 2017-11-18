// debug tools
var canvas, engine, scene;

function createScene () { // Initialize scene
  
  scene = new BABYLON.Scene(engine);
  // scene.debugLayer.show();

  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

  // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
  // sphere.position.y = 1;

  var ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 1.5, width: 2.5, subdivisions: 900}, scene);

  return scene;
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
      });
    });

    window.addEventListener("resize", function () {
      engine.resize();
    });
  } else {
      alert("Sorry! Your browser isn't supported :(");
  }
}