const THREE = SupEngine.THREE;

export default class SelectionRenderer extends SupEngine.ActorComponent {
  actor: SupEngine.Actor;
  width: number;
  height: number;

  mesh: THREE.Line;

  constructor(actor: SupEngine.Actor) {
    super(actor, "SelectionRenderer");
  }

  setIsLayerActive(active: boolean) { if (this.mesh != null) this.mesh.visible = active; }

  setSize(width: number, height: number) {
    if (this.mesh != null) this._clearMesh();

    this.width = width;
    this.height = height;
    this._createMesh();
  }

  _createMesh() {
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([
      new THREE.Vector3(-this.width / 2, -this.height / 2, 0),
      new THREE.Vector3( this.width / 2, -this.height / 2, 0),
      new THREE.Vector3( this.width / 2,  this.height / 2, 0),
      new THREE.Vector3(-this.width / 2,  this.height / 2, 0),
      new THREE.Vector3(-this.width / 2, -this.height / 2, 0)
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 1, depthTest: false, depthWrite: false, transparent: true });

    this.mesh = new THREE.Line(geometry, material);
    this.actor.threeObject.add(this.mesh);
    this.mesh.updateMatrixWorld(false);
  }

  _clearMesh() {
    if (this.mesh == null) return;

    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.actor.threeObject.remove(this.mesh);
    this.mesh = null;
  }

  _destroy() {
    this._clearMesh();
    super._destroy();
  }
}
