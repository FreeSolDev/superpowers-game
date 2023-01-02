const THREE = SupEngine.THREE;

export default class GridHelper extends SupEngine.ActorComponent {
  gridMajor: THREE.GridHelper;
  gridMinor: THREE.GridHelper;
  xAxis: THREE.Line;
  yAxis: THREE.Line;
  step: number;
  visible = true;

  camera: SupEngine.Camera;

  constructor(actor: SupEngine.Actor, supCamera: SupEngine.Camera, step: number) {
    super(actor, "GridHelper");

    this.camera = supCamera;
    this.step = step;

    this._createGrid();
    this.update();
  }

  setIsLayerActive(active: boolean) { this.gridMajor.visible = this.gridMinor.visible = active && this.visible; }

  update() {
    const p = this.camera.actor.getGlobalPosition(new THREE.Vector3());
    let cameraSize = 10;
    if (this.camera.isOrthographic)
      cameraSize = this.camera.orthographicScale;
    else
      cameraSize = Math.abs(p.y); // height

    let logCam = Math.log10(cameraSize);
    if (!this.camera.isOrthographic)
      logCam = Math.max(0.51, logCam);
    let nextTen = Math.pow(10, Math.round(logCam));

    this.gridMinor.scale.setScalar(nextTen / 100 * this.step);
    this.gridMajor.scale.setScalar(nextTen / 10 * this.step);
    this.xAxis.scale.setScalar(nextTen / 10 * this.step);
    this.yAxis.scale.setScalar(nextTen / 10 * this.step);

    if (this.camera.isOrthographic) {
      this.gridMajor.position.x = (p.x - p.x % (nextTen / 10 * this.step));
      this.gridMajor.position.z = -(p.y - p.y % (nextTen / 10 * this.step));

      this.gridMinor.position.x = (p.x - p.x % (nextTen / 100 * this.step));
      this.gridMinor.position.z = -(p.y - p.y % (nextTen / 100 * this.step));

      this.xAxis.position.x = p.x;
      this.yAxis.position.z = -p.y;

      let depth = Math.min(p.z - 1, 0);
      this.gridMajor.position.y = depth;
      this.gridMinor.position.y = depth;
      this.xAxis.position.y = depth;
      this.yAxis.position.y = depth;
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
    (this.gridMinor.material as THREE.Material).depthWrite = false;

    this.gridMajor = new THREE.GridHelper(200, 200, 0x888888, 0x888888);
    (this.gridMajor.material as THREE.Material).transparent = true;
    (this.gridMajor.material as THREE.Material).opacity = 0.5;
    (this.gridMajor.material as THREE.Material).depthWrite = false;

    const lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.setAttribute("position", new THREE.Float32BufferAttribute([-100, 0, 0, 100, 0, 0], 3));
    let lineMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    lineMat.transparent = true;
    lineMat.opacity = 0.5;
    lineMat.depthWrite = false;
    this.xAxis = new THREE.LineSegments(lineXGeometry, lineMat);

    const lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -100, 0, 0, 100], 3));
    this.yAxis = new THREE.LineSegments(lineYGeometry, lineMat);

    this.actor.threeObject.add(this.gridMinor);
    this.actor.threeObject.add(this.gridMajor);
    this.actor.threeObject.add(this.xAxis);
    this.actor.threeObject.add(this.yAxis);

    this.setVisible(this.visible);
    this.actor.threeObject.updateMatrixWorld();
  }

  setVisible(visible: boolean) {
    this.gridMajor.visible = this.gridMinor.visible = this.xAxis.visible = this.yAxis.visible = this.visible = visible;
  }
}
