const THREE = SupEngine.THREE;
import Light from "./Light";
import LightUpdater from "./LightUpdater";

export default class LightMarker extends Light {
  /* tslint:disable:variable-name */
  static Updater = LightUpdater;
  /* tslint:enable:variable-name */

  lightMarker: THREE.PointLightHelper|THREE.SpotLightHelper|THREE.DirectionalLightHelper;
  cameraHelper: THREE.CameraHelper;
  icon: THREE.Sprite;

  constructor(actor: SupEngine.Actor) {
    super(actor);

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load( "images/lightIcon.png" );
    const material = new THREE.SpriteMaterial( { map: map, color: this.color } );
    this.icon = new THREE.Sprite(material);
    this.actor.threeObject.add(this.icon);
  }

  setType(type: string) {
    if (this.lightMarker != null) this.actor.gameInstance.threeScene.remove(this.lightMarker);
    if (this.cameraHelper != null) {
      this.actor.gameInstance.threeScene.remove(this.cameraHelper);
      this.cameraHelper = null;
    }

    super.setType(type);

    switch (type) {
      case "ambient":
        this.lightMarker = null;
        break;
      case "point":
        this.lightMarker = new THREE.PointLightHelper(this.light as THREE.PointLight, 1);
        break;
      case "spot":
        this.lightMarker = new THREE.SpotLightHelper(this.light as THREE.SpotLight);
        break;
      case "directional":
        this.lightMarker = new THREE.DirectionalLightHelper(this.light as THREE.DirectionalLight, 1);
        break;
    }

    if (this.lightMarker != null) {
      this.actor.gameInstance.threeScene.add(this.lightMarker);
      this.lightMarker.updateMatrixWorld(true);
      this.lightMarker.visible = false;
    }
    this.icon.material.color.setHex(this.color);
  }

  setColor(color: number) {
    super.setColor(color);
    this.icon.material.color.setHex(color);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setIntensity(intensity: number) {
    super.setIntensity(intensity);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setDistance(distance: number) {
    super.setDistance(distance);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setAngle(angle: number) {
    super.setAngle(angle);
    if (this.lightMarker != null) this.lightMarker.update();
    if (this.cameraHelper != null) this.cameraHelper.update(); // for spotlight
  }

  setPenumbra(penumbra: number) {
    super.setPenumbra(penumbra);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setDecay(decay: number) {
    super.setDecay(decay);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setTarget(x: number, y: number, z: number) {
    super.setTarget(x, y, z);
    if (this.lightMarker != null) this.lightMarker.update();
  }

  setCastShadow(castShadow: boolean) {
    super.setCastShadow(castShadow);
    if (castShadow) {
      this.cameraHelper = new THREE.CameraHelper((this.light as THREE.DirectionalLight|THREE.SpotLight).shadow.camera);
      this.actor.gameInstance.threeScene.add(this.cameraHelper);
      this.cameraHelper.visible = false;
    } else {
      this.actor.gameInstance.threeScene.remove(this.cameraHelper);
      this.cameraHelper = null;
    }
  }

  setShadowCameraNearPlane(near: number) {
    super.setShadowCameraNearPlane(near);
    if (this.cameraHelper != null) this.cameraHelper.update();
  }

  setShadowCameraFarPlane(far: number) {
    super.setShadowCameraFarPlane(far);
    if (this.cameraHelper != null) this.cameraHelper.update();
  }

  setShadowCameraFocus(focus: number) {
    super.setShadowCameraFocus(focus);
    if (this.cameraHelper != null) this.cameraHelper.update();
  }

  setShadowCameraSize(top: number, bottom: number, left: number, right: number) {
    super.setShadowCameraSize(top, bottom, left, right);
    if (this.cameraHelper != null) this.cameraHelper.update();
  }

  onActorSelected(isSelected: boolean) {
    if (this.lightMarker != null) this.lightMarker.visible = isSelected;
    if (this.cameraHelper != null) this.cameraHelper.visible = isSelected;
  }

  update() {
    // TODO: Only do that when the transform has changed
    if (this.lightMarker != null) {
      this.lightMarker.updateMatrixWorld(true);
      this.lightMarker.update();
    }
    this.actor.gameInstance.threeScene.updateMatrixWorld(false);
  }

  _destroy() {
    if (this.lightMarker != null) this.actor.gameInstance.threeScene.remove(this.lightMarker);
    if (this.cameraHelper != null) this.actor.gameInstance.threeScene.remove(this.cameraHelper);
    super._destroy();
  }
}
