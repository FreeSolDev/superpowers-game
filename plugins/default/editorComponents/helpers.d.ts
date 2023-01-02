declare class Camera3DControls extends SupEngine.ActorComponent {
  movementSpeed: number;

  constructor(actor: SupEngine.Actor, camera: SupEngine.Camera);

  setIsLayerActive(active: boolean): void;
}

interface Camera2DControlsOptions {
  zoomMin: number;
  zoomMax: number;
  zoomSpeed: number;
}
declare class Camera2DControls extends SupEngine.ActorComponent {
  constructor(actor: SupEngine.Actor, camera: SupEngine.Camera, options: Camera2DControlsOptions, zoomCallback?: Function);

  setIsLayerActive(active: boolean): void;

  setMultiplier(newMultiplier: number): void;
}

interface DataGrid {
  width: number;
  height: number;
  direction?: number;
  orthographicScale: number;
  ratio: { x: number; y: number; };
}
declare class GridRenderer extends SupEngine.ActorComponent {
  constructor(actor: SupEngine.Actor, data?: DataGrid);

  setIsLayerActive(active: boolean): void;

  setGrid(data: DataGrid): void;
  resize(width: number, height: number): void;
  setOrthographicScale(orthographicScale: number): void;
  setRatio(ratio: { x: number; y: number; }): void;
}


interface SelectionBox extends SupEngine.ActorComponent {
  setTargets(targets: THREE.Object3D[]): void;
  move(): void;
  resize(): void;
}

interface TransformHandle extends SupEngine.ActorComponent {
  control: any;
  target: THREE.Object3D;
  mode: string;

  setMode(mode: string): void;
  setSpace(space: string): void;
  setTarget(target: THREE.Object3D): void;
  move(): void;
}

interface TransformMarker extends SupEngine.ActorComponent {
  move(target: THREE.Object3D): void;
  hide(): void;
}

interface GridHelper extends SupEngine.ActorComponent {
  step: number;

  setVisible(visible: boolean): void;
}

interface SkyHelper extends SupEngine.ActorComponent {
  setup(): void;
  setVisible(visible: boolean): void;
}
