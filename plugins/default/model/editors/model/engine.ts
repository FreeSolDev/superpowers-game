const THREE = SupEngine.THREE;

const engine: {
  gameInstance?: SupEngine.GameInstance;
  cameraActor?: SupEngine.Actor;
} = {};
export default engine;

const canvasElt = <HTMLCanvasElement>document.querySelector("canvas");
engine.gameInstance = new SupEngine.GameInstance(canvasElt);

engine.cameraActor = new SupEngine.Actor(engine.gameInstance, "Camera");
engine.cameraActor.setLocalPosition(new THREE.Vector3(3, 2, 3));
engine.cameraActor.lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
const cameraComponent = new SupEngine.componentClasses["Camera"](engine.cameraActor) as SupEngine.Camera;
SupEngine.createEditorComponent<Camera3DControls>("Camera3DControls", engine.cameraActor, cameraComponent);

const gridActor = new SupEngine.Actor(engine.gameInstance, "Grid", null, { layer: 0 });
SupEngine.createEditorComponent<GridHelper>("GridHelper", gridActor, cameraComponent, 1.0);

const light = new THREE.AmbientLight(0xcfcfcf);
engine.gameInstance.threeScene.add(light);

/*const pointLight = new THREE.PointLight(0xffffff, 0.2);
engine.cameraActor.threeObject.add(pointLight);
pointLight.updateMatrixWorld(false);*/

let isTabActive = true;
let animationFrame: number;

window.addEventListener("message", (event) => {
  if (event.data.type === "deactivate" || event.data.type === "activate") {
    isTabActive = event.data.type === "activate";
    onChangeActive();
  }
});

function onChangeActive() {
  const stopRendering = !isTabActive;

  if (stopRendering) {
    if (animationFrame != null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  } else if (animationFrame == null) {
    animationFrame = requestAnimationFrame(tick);
  }
}

let lastTimestamp = 0;
let accumulatedTime = 0;
function tick(timestamp = 0) {
  accumulatedTime += timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  const { updates, timeLeft } = engine.gameInstance.tick(accumulatedTime);
  accumulatedTime = timeLeft;

  if (updates > 0) engine.gameInstance.draw();
  animationFrame = requestAnimationFrame(tick);
}
animationFrame = requestAnimationFrame(tick);
