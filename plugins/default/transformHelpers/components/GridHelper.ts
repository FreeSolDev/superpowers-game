const THREE = SupEngine.THREE;

export default class GridHelper extends SupEngine.ActorComponent {
  gridMajor: THREE.GridHelper;
  gridMinor: THREE.GridHelper;
  xAxis: THREE.Line;
  yAxis: THREE.Line;
  step: number;
  visible = true;

  camera: THREE.Camera;

  constructor(actor: SupEngine.Actor, threeCamera: THREE.Camera, step: number) {
    super(actor, "GridHelper");

    this.camera = threeCamera;
    this.step = step;

    this._createGrid();
    this.update();
  }

  setIsLayerActive(active: boolean) { this.gridMajor.visible = this.gridMinor.visible = active && this.visible; }

  update() {
    let cameraSize = 10;
    if (this.camera.type === "OrthographicCamera")
      cameraSize = (this.camera as any).top - (this.camera as any).bottom;
    else if (this.camera.type === "PerspectiveCamera")
      cameraSize = Math.abs(this.camera.matrixWorld.elements[13]); // height

    let logCam = Math.log10(cameraSize);
    if (this.camera.type === "PerspectiveCamera")
      logCam = Math.max(0.51, logCam);
    let nextTen = Math.pow(10, Math.round(logCam));

    this.gridMinor.scale.setScalar(nextTen / 100 * this.step);
    this.gridMajor.scale.setScalar(nextTen / 10 * this.step);
    this.xAxis.scale.setScalar(nextTen / 10 * this.step);
    this.yAxis.scale.setScalar(nextTen / 10 * this.step);

    if (this.camera.type === "OrthographicCamera") {
      this.gridMajor.position.x = (this.camera.matrixWorld.elements[12] - this.camera.matrixWorld.elements[12] % (nextTen / 10 * this.step));
      this.gridMajor.position.z = -(this.camera.matrixWorld.elements[13] - this.camera.matrixWorld.elements[13] % (nextTen / 10 * this.step));
      this.gridMajor.position.y = this.camera.matrixWorld.elements[14] - 1;

      this.gridMinor.position.x = (this.camera.matrixWorld.elements[12] - this.camera.matrixWorld.elements[12] % (nextTen / 100 * this.step));
      this.gridMinor.position.z = -(this.camera.matrixWorld.elements[13] - this.camera.matrixWorld.elements[13] % (nextTen / 100 * this.step));
      this.gridMinor.position.y = this.camera.matrixWorld.elements[14] - 1;

      this.xAxis.position.x = this.camera.matrixWorld.elements[12];
      this.yAxis.position.z = -this.camera.matrixWorld.elements[13];
      this.xAxis.position.y = this.camera.matrixWorld.elements[14] - 1;
      this.yAxis.position.y = this.camera.matrixWorld.elements[14] - 1;
    } else {
      this.gridMajor.position.x = 0;
      this.gridMajor.position.z = 0;
      this.gridMajor.position.y = 0;

      this.gridMinor.position.x = 0;
      this.gridMinor.position.z = 0;
      this.gridMinor.position.y = 0;

      this.xAxis.position.x = 0;
      this.yAxis.position.z = 0;
      this.xAxis.position.y = 0;
      this.yAxis.position.y = 0;
    }
    this.actor.threeObject.updateMatrixWorld();

    let off = logCam - Math.round(logCam); // -0.5 > 0.5
    (this.gridMajor.material as THREE.LineBasicMaterial).opacity = 0.5 - Math.max(0, off) / 2.0; // 0.25 > 0.5
    (this.gridMinor.material as THREE.LineBasicMaterial).opacity = -Math.min(0, off) / 2.0; // 0 > 0.25
  }

  _dispose() {
    if (this.gridMajor != null) {
      this.actor.threeObject.remove(this.gridMajor);
      this.gridMajor.geometry.dispose();
      (this.gridMajor.material as THREE.Material).dispose();
      this.gridMajor = null;
    }
    if (this.gridMinor != null) {
      this.actor.threeObject.remove(this.gridMinor);
      this.gridMinor.geometry.dispose();
      (this.gridMinor.material as THREE.Material).dispose();
      this.gridMinor = null;
    }
    if (this.xAxis != null) {
      this.actor.threeObject.remove(this.xAxis);
      this.xAxis.geometry.dispose();
      (this.xAxis.material as THREE.Material).dispose();
      this.xAxis = null;
    }
    if (this.yAxis != null) {
      this.actor.threeObject.remove(this.yAxis);
      this.yAxis.geometry.dispose();
      (this.yAxis.material as THREE.Material).dispose();
      this.yAxis = null;
    }
  }

  _createGrid() {
    this._dispose();

    this.gridMinor = new THREE.GridHelper(2000, 2000, 0x888888, 0x888888);
    (this.gridMinor.material as THREE.Material).transparent = true;
    (this.gridMinor.material as THREE.Material).opacity = 0.25;
    this.actor.threeObject.add(this.gridMinor);

    this.gridMajor = new THREE.GridHelper(200, 200, 0x888888, 0x888888);
    (this.gridMajor.material as THREE.Material).transparent = true;
    (this.gridMajor.material as THREE.Material).opacity = 0.5;
    this.actor.threeObject.add(this.gridMajor);

    const lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.setAttribute("position", new THREE.Float32BufferAttribute([-100, 0, 0, 100, 0, 0], 3));
    this.xAxis = new THREE.Line(lineXGeometry, new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }));
    this.actor.threeObject.add(this.xAxis);

    const lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -100, 0, 0, 100], 3));
    this.yAxis = new THREE.Line(lineYGeometry, new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }));
    this.actor.threeObject.add(this.yAxis);

    this.setVisible(this.visible);
    this.actor.threeObject.updateMatrixWorld();
  }

  setVisible(visible: boolean) {
    this.gridMajor.visible = this.gridMinor.visible = this.xAxis.visible = this.yAxis.visible = this.visible = visible;
  }
}
