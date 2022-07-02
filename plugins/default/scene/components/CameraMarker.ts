const THREE = SupEngine.THREE;

import CameraUpdater from "./CameraUpdater";

export default  class CameraMarker extends SupEngine.ActorComponent {
  /* tslint:disable:variable-name */
  static Updater = CameraUpdater;
  /* tslint:enable:variable-name */

  viewport: { x: number; y: number; width: number; height: number; };
  nearClippingPlane: number;
  farClippingPlane: number;
  isOrthographic: boolean;
  fov: number;
  orthographicScale: number;
  ratio: number;

  projectionNeedsUpdate: boolean;
  line: THREE.LineSegments;
  icon: THREE.Sprite;
  lineVisible: boolean;

  constructor(actor: SupEngine.Actor) {
    super(actor, "Marker");

    this.viewport = { x: 0, y: 0, width: 1, height: 1 };

    this.projectionNeedsUpdate = true;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(24 * 3), 3));

    this.line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ));
    this.actor.threeObject.add(this.line);
    this.line.updateMatrixWorld(false);
    this.line.userData.dontShowBound = true;

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load( "images/cameraIcon.png" );
    const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
    this.icon = new THREE.Sprite(material);
    this.actor.threeObject.add(this.icon);
    this.icon.userData.dontShowBound = true;
    this.lineVisible = false;
  }

  setIsLayerActive(active: boolean) { this.line.visible = active && (this.lineVisible || this.isOrthographic); }

  setConfig(config: any) {
    this.setOrthographicMode(config.mode === "orthographic");
    this.setFOV(config.fov);
    this.setOrthographicScale(config.orthographicScale);
    this.setViewport(config.viewport.x, config.viewport.y, config.viewport.width, config.viewport.height);
    this.setNearClippingPlane(config.nearClippingPlane);
    this.setFarClippingPlane(config.farClippingPlane);

    this.projectionNeedsUpdate = false;
    this._resetGeometry();
  }

  setOrthographicMode(isOrthographic: boolean) {
    this.isOrthographic = isOrthographic;
    this.projectionNeedsUpdate = true;
    this.icon.visible = !isOrthographic;
  }

  setFOV(fov: number) {
    this.fov = fov;
    if (!this.isOrthographic) this.projectionNeedsUpdate = true;
  }

  setOrthographicScale(orthographicScale: number) {
    this.orthographicScale = orthographicScale;
    if (this.isOrthographic) this.projectionNeedsUpdate = true;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.viewport.x = x;
    this.viewport.y = y;
    this.viewport.width = width;
    this.viewport.height = height;
    this.projectionNeedsUpdate = true;
  }

  setNearClippingPlane(nearClippingPlane: number) {
    this.nearClippingPlane = nearClippingPlane;
    this.projectionNeedsUpdate = true;
  }

  setFarClippingPlane(farClippingPlane: number) {
    this.farClippingPlane = farClippingPlane;
    this.projectionNeedsUpdate = true;
  }

  setRatio(ratio: number) {
    this.ratio = ratio;
    this.projectionNeedsUpdate = true;
  }

  _resetGeometry() {
    const near = this.nearClippingPlane;
    const far = this.farClippingPlane;

    let farTopRight: THREE.Vector3;
    let nearTopRight: THREE.Vector3;

    if (this.isOrthographic) {
      let right = this.orthographicScale / 2 * this.viewport.width / this.viewport.height;
      if (this.ratio != null) right *= this.ratio;
      farTopRight = new THREE.Vector3(right, this.orthographicScale / 2, far);
      nearTopRight = new THREE.Vector3(right, this.orthographicScale / 2, near);
    }
    else {
      const tan = Math.tan(THREE.MathUtils.degToRad(this.fov / 2));
      farTopRight = new THREE.Vector3(far * tan, far * tan, far);
      nearTopRight = farTopRight.clone().normalize().multiplyScalar(near);
    }

    const vertices = this.line.geometry.getAttribute("position");

    // Near plane
    vertices.setXYZ(0, -nearTopRight.x,  nearTopRight.y, -near);
    vertices.setXYZ(1,  nearTopRight.x,  nearTopRight.y, -near);
    vertices.setXYZ(2,  nearTopRight.x,  nearTopRight.y, -near);
    vertices.setXYZ(3,  nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(4,  nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(5, -nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(6, -nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(7, -nearTopRight.x,  nearTopRight.y, -near);

    // Far plane
    vertices.setXYZ(8 , -farTopRight.x,  farTopRight.y, -far);
    vertices.setXYZ(9 ,  farTopRight.x,  farTopRight.y, -far);
    vertices.setXYZ(10,  farTopRight.x,  farTopRight.y, -far);
    vertices.setXYZ(11,  farTopRight.x, -farTopRight.y, -far);
    vertices.setXYZ(12,  farTopRight.x, -farTopRight.y, -far);
    vertices.setXYZ(13, -farTopRight.x, -farTopRight.y, -far);
    vertices.setXYZ(14, -farTopRight.x, -farTopRight.y, -far);
    vertices.setXYZ(15, -farTopRight.x,  farTopRight.y, -far);

    // Lines
    vertices.setXYZ(16, -nearTopRight.x,  nearTopRight.y, -near);
    vertices.setXYZ(17, -farTopRight.x,   farTopRight.y,  -far);
    vertices.setXYZ(18,  nearTopRight.x,  nearTopRight.y, -near);
    vertices.setXYZ(19,  farTopRight.x,   farTopRight.y,  -far);
    vertices.setXYZ(20,  nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(21,  farTopRight.x,  -farTopRight.y,  -far);
    vertices.setXYZ(22, -nearTopRight.x, -nearTopRight.y, -near);
    vertices.setXYZ(23, -farTopRight.x,  -farTopRight.y,  -far);

    vertices.needsUpdate = true;
  }

  onActorSelected(isSelected: boolean) {
    this.lineVisible = isSelected;
  }

  _destroy() {
    this.actor.threeObject.remove(this.line);
    this.line.geometry.dispose();
    (this.line.material as THREE.Material).dispose();
    this.line = null;

    super._destroy();
  }

  update() {
    if (this.projectionNeedsUpdate) {
      this.projectionNeedsUpdate = false;
      this._resetGeometry();
    }
  }
}
