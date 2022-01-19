const THREE = SupEngine.THREE;

export default class SelectionBox extends SupEngine.ActorComponent {
  line: THREE.LineSegments;
  localLines: THREE.LineSegments[] = [];
  targets: THREE.Object3D[] = [];

  constructor(actor: SupEngine.Actor) {
    super(actor, "SelectionBox");

    let globalGeometry = new THREE.Geometry();
    for (let i = 0; i < 24; i++) globalGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
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

        const geometry: THREE.Geometry|THREE.BufferGeometry = (<any>node).geometry;

        if (geometry != null) {
          node.updateMatrixWorld(false);

          if (geometry instanceof THREE.Geometry) {
            const vertices = geometry.vertices;

            for (let i = 0, il = vertices.length; i < il; i++) {
              vec.copy(vertices[i]).applyMatrix4(node.matrixWorld);
              globalBox.expandByPoint(vec);
              vec.applyMatrix4(inverseTargetMatrixWorld);
              localBox.expandByPoint(vec);
            }

          } else if (geometry instanceof THREE.BufferGeometry && (<any>geometry.attributes)["position"] != null) {
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
        }
      });

      if (this.localLines.length <= i) {
        let localGeometry = new THREE.Geometry();
        for (let i = 0; i < 24; i++) localGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        this.updateGeometry(localGeometry, localBox);
        let line = new THREE.LineSegments(localGeometry, new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.75, depthTest: false, depthWrite: false, transparent: true }));
        this.localLines.push(line);
        this.actor.threeObject.add(line);
      } else {
        this.updateGeometry(this.localLines[i].geometry as THREE.Geometry, localBox);
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

    this.updateGeometry(this.line.geometry as THREE.Geometry, globalBox);
  }

  updateGeometry(geometry: THREE.Geometry, box: THREE.Box3) {
    const min = box.min;
    const max = box.max;

    // Front
    geometry.vertices[0].set(max.x, min.y, min.z);
    geometry.vertices[1].set(min.x, min.y, min.z);
    geometry.vertices[2].set(min.x, min.y, min.z);
    geometry.vertices[3].set(min.x, max.y, min.z);
    geometry.vertices[4].set(min.x, max.y, min.z);
    geometry.vertices[5].set(max.x, max.y, min.z);
    geometry.vertices[6].set(max.x, max.y, min.z);
    geometry.vertices[7].set(max.x, min.y, min.z);

    // Back
    geometry.vertices[8].set( min.x, max.y, max.z);
    geometry.vertices[9].set( max.x, max.y, max.z);
    geometry.vertices[10].set(max.x, max.y, max.z);
    geometry.vertices[11].set(max.x, min.y, max.z);
    geometry.vertices[12].set(max.x, min.y, max.z);
    geometry.vertices[13].set(min.x, min.y, max.z);
    geometry.vertices[14].set(min.x, min.y, max.z);
    geometry.vertices[15].set(min.x, max.y, max.z);

    // Lines
    geometry.vertices[16].set(max.x, min.y, min.z);
    geometry.vertices[17].set(max.x, min.y, max.z);
    geometry.vertices[18].set(max.x, max.y, min.z);
    geometry.vertices[19].set(max.x, max.y, max.z);
    geometry.vertices[20].set(min.x, max.y, min.z);
    geometry.vertices[21].set(min.x, max.y, max.z);
    geometry.vertices[22].set(min.x, min.y, min.z);
    geometry.vertices[23].set(min.x, min.y, max.z);

    geometry.verticesNeedUpdate = true;
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
