// debug tools
var canvas, engine, scene;
var gui, gui_placename, gui_weather, gui_usercount;
var camera, cam_height = 5;

function createScene () { // Initialize scene
  
  scene = new BABYLON.Scene(engine);
  // scene.debugLayer.show();

  camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  var wh_ratio = window.innerWidth/window.innerHeight;
  camera.orthoTop = cam_height;
  camera.orthoBottom = -cam_height;
  camera.orthoLeft = -wh_ratio*cam_height;  
  camera.orthoRight = wh_ratio*cam_height;
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

  var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
  sphere.position.y = 1;

  var ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 1.5, width: 2.5, subdivisions: 900}, scene);

  renderGUI();

  return scene;
}

function renderGUI () {
  // GUI
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  gui_placename = new BABYLON.GUI.TextBlock();
  gui_placename.text = placeName.charAt(0).toUpperCase() + placeName.slice(1);
  gui_placename.color = "white";
  gui_placename.fontSize = 72;
  gui_placename.fontFamily = "Arial";
  advancedTexture.addControl(gui_placename);
  gui_placename.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_placename.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_weather = new BABYLON.GUI.TextBlock();
  gui_weather.text = 'The weather is ' + (data.precip ? 'et': 'dry');
  gui_weather.color = "white";
  gui_weather.fontSize = 26;
  gui_weather.paddingTop = 72;
  gui_weather.paddingLeft = 8;
  gui_weather.fontFamily = "Arial";
  advancedTexture.addControl(gui_weather);
  gui_weather.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gui_weather.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  gui_usercount = new BABYLON.GUI.TextBlock();
  gui_usercount.text = userCnt + ' user(s) connected';
  gui_usercount.color = "white";
  gui_usercount.fontSize = 14;
  gui_usercount.fontFamily = "Arial";
  advancedTexture.addControl(gui_usercount);
  gui_usercount.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  gui_usercount.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
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
      });
    });

    window.addEventListener("resize", function () {
      engine.resize();

      var wh_ratio = window.innerWidth/window.innerHeight;
      camera.orthoLeft = -wh_ratio*cam_height;
      camera.orthoRight = wh_ratio*cam_height;
    });
  } else {
      alert("Sorry! Your browser isn't supported :(");
  }
}