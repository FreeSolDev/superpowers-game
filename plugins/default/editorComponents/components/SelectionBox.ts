const THREE = SupEngine.THREE;

export default class SelectionBox extends SupEngine.ActorComponent {
  line: THREE.LineSegments;
  localLines: THREE.LineSegments[] = [];
  targets: THREE.Object3D[] = [];

  constructor(actor: SupEngine.Actor) {
    super(actor, "SelectionBox");

    let globalGeometry = new THREE.BufferGeometry();
    globalGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(24 * 3), 3));

    this.line = new THREE.LineSegments(globalGeometry, new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 1, depthTest: false, depthWrite: false, transparent: true }));
    this.actor.threeObject.add(this.line);
    this.line.updateMatrixWorld(false);
    this.line.visible = false;
  }

  setIsLayerActive(active: boolean) { this.line.visible = active && this.targets.length > 1; }

  setTargets(targets: THREE.Object3D[]) {
    this.targets = targets;
    this.line.visible = this.targets.length > 1;
    for (let line of this.localLines) line.visible = false;

    if (this.targets.length > 0)
      this.resize();
  }

  resize() {
    const vec = new THREE.Vector3();
    const globalBox = new THREE.Box3();

    for (let i = 0; i < this.targets.length; i++) {
      const inverseTargetMatrixWorld = new THREE.Matrix4().compose(
        this.targets[i].getWorldPosition(new THREE.Vector3()),
        this.targets[i].getWorldQuaternion(new THREE.Quaternion()),
        <THREE.Vector3>{ x: 1, y: 1, z: 1 }
      );

      inverseTargetMatrixWorld.invert();

      const localBox = new THREE.Box3();

      this.targets[i].traverse((node) => {
        if (node.userData.dontShowBound) return;

        const geometry: THREE.BufferGeometry = (<any>node).geometry;

        if (geometry != null) {
          node.updateMatrixWorld(false);

          if ((<any>geometry.attributes)["position"] != null) {
            const positions: Float32Array = (<any>geometry.attributes)["position"].array;
            const len = Math.min(positions.length, geometry.drawRange.count * 2);

            for (let i = 0, il = len; i < il; i += 3) {
              vec.set(positions[i], positions[i + 1], positions[i + 2]);
              vec.applyMatrix4(node.matrixWorld);
              globalBox.expandByPoint(vec);
              vec.applyMatrix4(inverseTargetMatrixWorld);
              localBox.expandByPoint(vec);
            }
          }
        } else {
          vec.set(0, 0, 0);
          localBox.expandByPoint(vec);
          vec.applyMatrix4(node.matrixWorld);
          globalBox.expandByPoint(vec);
        }
      });

      if (this.localLines.length <= i) {
        let localGeometry = new THREE.BufferGeometry();
        localGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(24 * 3), 3));
        this.updateGeometry(localGeometry, localBox);
        let line = new THREE.LineSegments(localGeometry, new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.75, depthTest: false, depthWrite: false, transparent: true }));
        this.localLines.push(line);
        this.actor.threeObject.add(line);
      } else {
        this.updateGeometry(this.localLines[i].geometry, localBox);
        this.localLines[i].visible = true;
      }

      if (this.targets.length === 1)
        (this.localLines[i].material as THREE.LineBasicMaterial).color.setHex(0x00fffff);
      else
        (this.localLines[i].material as THREE.LineBasicMaterial).color.setHex(0xff0000);

      this.targets[i].getWorldPosition(this.localLines[i].position);
      this.targets[i].getWorldQuaternion(this.localLines[i].quaternion);
      this.localLines[i].updateMatrixWorld(false);
    }

    this.updateGeometry(this.line.geometry, globalBox);
  }

  updateGeometry(geometry: THREE.BufferGeometry, box: THREE.Box3) {
    const min = box.min;
    const max = box.max;

    const pos = geometry.getAttribute("position");

    // Front
    pos.setXYZ(0 , max.x, min.y, min.z);
    pos.setXYZ(1 , min.x, min.y, min.z);
    pos.setXYZ(2 , min.x, min.y, min.z);
    pos.setXYZ(3 , min.x, max.y, min.z);
    pos.setXYZ(4 , min.x, max.y, min.z);
    pos.setXYZ(5 , max.x, max.y, min.z);
    pos.setXYZ(6 , max.x, max.y, min.z);
    pos.setXYZ(7 , max.x, min.y, min.z);

    // Back
    pos.setXYZ(8 , min.x, max.y, max.z);
    pos.setXYZ(9 , max.x, max.y, max.z);
    pos.setXYZ(10, max.x, max.y, max.z);
    pos.setXYZ(11, max.x, min.y, max.z);
    pos.setXYZ(12, max.x, min.y, max.z);
    pos.setXYZ(13, min.x, min.y, max.z);
    pos.setXYZ(14, min.x, min.y, max.z);
    pos.setXYZ(15, min.x, max.y, max.z);

    // Lines
    pos.setXYZ(16, max.x, min.y, min.z);
    pos.setXYZ(17, max.x, min.y, max.z);
    pos.setXYZ(18, max.x, max.y, min.z);
    pos.setXYZ(19, max.x, max.y, max.z);
    pos.setXYZ(20, min.x, max.y, min.z);
    pos.setXYZ(21, min.x, max.y, max.z);
    pos.setXYZ(22, min.x, min.y, min.z);
    pos.setXYZ(23, min.x, min.y, max.z);

    pos.needsUpdate = true;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }

  _destroy() {
    this.actor.threeObject.remove(this.line);
    this.line.geometry.dispose();
    (this.line.material as THREE.Material).dispose();
    this.line = null;

    for (let line of this.localLines) {
      this.actor.threeObject.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    this.localLines = [];

    super._destroy();
  }
}
