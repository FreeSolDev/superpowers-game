import ui, { selectBrushTool, selectFillTool } from "./ui";
import { setupPattern } from "./mapArea";
import { data } from "./network";

const tmpVector3 = new SupEngine.THREE.Vector3();

const tileSetArea: {
  gameInstance?: SupEngine.GameInstance;

  cameraComponent?: any;

  selectedLayerId?: string;

  selectionStartPoint?: { x: number; y : number };
  selectionEndPoint?: { x: number; y : number };
} = {};

tileSetArea.gameInstance = new SupEngine.GameInstance(<HTMLCanvasElement>document.querySelector("canvas.tileSet"));

const cameraActor = new SupEngine.Actor(tileSetArea.gameInstance, "Camera");
tileSetArea.cameraComponent = new SupEngine.componentClasses["Camera"](cameraActor) as SupEngine.Camera;
tileSetArea.cameraComponent.setOrthographicMode(true);
tileSetArea.cameraComponent.setClearColor(0xbbbbbb);
cameraActor.setLocalPosition(new SupEngine.THREE.Vector3(tileSetArea.cameraComponent.cachedRatio * 5 - 0.2, -5 + 0.2, 10));
SupEngine.createEditorComponent<Camera2DControls>("Camera2DControls",
  cameraActor, tileSetArea.cameraComponent,
  { zoomSpeed: 1.5, zoomMin: 0.1, zoomMax: 10000 },
  () => { data.tileSetUpdater.tileSetRenderer.gridRenderer.setOrthographicScale(tileSetArea.cameraComponent.orthographicScale); }
);
export default tileSetArea;

function getTileSetGridPosition(gameInstance: SupEngine.GameInstance, cameraComponent: any) {
  const mousePosition = gameInstance.input.mousePosition;
  const position = new SupEngine.THREE.Vector3(mousePosition.x, mousePosition.y, 0);
  cameraComponent.actor.getLocalPosition(tmpVector3);
  const ratio = data.tileMapUpdater.tileSetAsset.pub.grid.width / data.tileMapUpdater.tileSetAsset.pub.grid.height;

  let x = position.x / gameInstance.threeRenderer.domElement.width;
  x = x * 2 - 1;
  x *= cameraComponent.orthographicScale / 2 * cameraComponent.cachedRatio;
  x += tmpVector3.x;
  x = Math.floor(x);

  let y = position.y / gameInstance.threeRenderer.domElement.height;
  y = y * 2 - 1;
  y *= cameraComponent.orthographicScale / 2;
  y -= tmpVector3.y;
  y *= ratio;
  y = Math.floor(y);

  return [ x, y ];
}

export function handleTileSetArea() {
  if (data.tileMapUpdater == null) return;
  if (data.tileMapUpdater.tileMapAsset == null) return;
  if (data.tileMapUpdater.tileSetAsset == null) return;
  if (data.tileMapUpdater.tileSetAsset.pub.texture == null) return;
  const input = tileSetArea.gameInstance.input;
  const keys = (<any>window).KeyEvent;

  const tilesPerRow = data.tileMapUpdater.tileSetAsset.pub.texture.image.width / data.tileMapUpdater.tileSetAsset.pub.grid.width;
  const tilesPerColumn = data.tileMapUpdater.tileSetAsset.pub.texture.image.height / data.tileMapUpdater.tileSetAsset.pub.grid.height;

  const [ mouseX, mouseY ] = getTileSetGridPosition(tileSetArea.gameInstance, tileSetArea.cameraComponent);
  if (input.mouseButtons[0].wasJustPressed && !input.keyboardButtons[keys.DOM_VK_ALT].isDown) {
    if (mouseX >= 0 && mouseX < tilesPerRow && mouseY >= 0 && mouseY < tilesPerColumn) {
      if (ui.fillToolButton.checked) {
        selectFillTool(mouseX, mouseY);
      } else {
        tileSetArea.selectionStartPoint = { x: mouseX, y: mouseY };
        selectBrushTool(mouseX, mouseY);
      }
    }
  } else if (tileSetArea.selectionStartPoint != null) {
    // Clamp mouse values
    let x = Math.max(0, Math.min(tilesPerRow - 1, mouseX));
    let y = Math.max(0, Math.min(tilesPerColumn - 1, mouseY));
    const startX = Math.min(tileSetArea.selectionStartPoint.x, x);
    const startY = Math.min(tileSetArea.selectionStartPoint.y, y);
    const width = Math.abs(x - tileSetArea.selectionStartPoint.x) + 1;
    const height = Math.abs(y - tileSetArea.selectionStartPoint.y) + 1;
    if (input.mouseButtons[0].wasJustReleased) {
      const layerData: (number|boolean)[][] = [];
      for (let y = height - 1; y >= 0; y--)
        for (let x = 0; x < width; x++)
          layerData.push([ startX + x, startY + y, false, false, 0 ]);

      setupPattern(layerData, width);
      selectBrushTool(startX, startY, width, height);
      tileSetArea.selectionStartPoint = null;
    } else {
      data.tileSetUpdater.tileSetRenderer.select(startX, startY, width, height);
    }
  }
}
