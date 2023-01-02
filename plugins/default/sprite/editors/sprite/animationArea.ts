import { data } from "./network";
import ui from "./ui";

import SpriteOriginMarker from "./SpriteOriginMarker";

import * as ResizeHandle from "resize-handle";

const animationArea: {
  gameInstance?: SupEngine.GameInstance;
  cameraControls?: any;
  originMakerComponent?: SpriteOriginMarker;
} = {};
export default animationArea;

new ResizeHandle(document.querySelector(".animation-container") as HTMLDivElement, "bottom");

animationArea.gameInstance = new SupEngine.GameInstance(<HTMLCanvasElement>document.querySelector(".animation-container canvas"));

const cameraActor = new SupEngine.Actor(animationArea.gameInstance, "Camera");
cameraActor.setLocalPosition(new SupEngine.THREE.Vector3(0, 0, 10));
const cameraComponent = new SupEngine.componentClasses["Camera"](cameraActor) as SupEngine.Camera;
cameraComponent.setOrthographicMode(true);
cameraComponent.setOrthographicScale(10);
cameraComponent.setClearColor(0xbbbbbb);
animationArea.cameraControls = SupEngine.createEditorComponent("Camera2DControls", cameraActor, cameraComponent,
  { zoomSpeed: 1.5, zoomMin: 0.5, zoomMax: 100 });

const originActor = new SupEngine.Actor(animationArea.gameInstance, "Origin");
originActor.setLocalPosition(new SupEngine.THREE.Vector3(0, 0, 1));
animationArea.originMakerComponent = new SpriteOriginMarker(originActor);

export function centerCamera() {
  if (data.spriteUpdater.spriteRenderer.asset == null) return;

  const pub = data.spriteUpdater.spriteAsset.pub;
  const scaleRatio = 1 / cameraComponent.orthographicScale;

  cameraActor.setLocalPosition(new SupEngine.THREE.Vector3(
    (0.5 - pub.origin.x) * pub.grid.width * scaleRatio,
    (0.5 - pub.origin.y) * pub.grid.height * scaleRatio, 10
  ));
}

export function handleAnimationArea() {
  if (data != null && ui.selectedAnimationId != null) {
    if (!data.spriteUpdater.spriteRenderer.isAnimationPlaying) {
      ui.animationPlay.textContent = "▶";
    } else {
      ui.animationSlider.value = data.spriteUpdater.spriteRenderer.getAnimationFrameIndex().toString();
    }
  }
}
