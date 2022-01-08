const THREE = SupEngine.THREE;

export default class Light extends SupEngine.ActorComponent {
  light: THREE.AmbientLight|THREE.PointLight|THREE.SpotLight|THREE.DirectionalLight;
  type: string;
  color = 0xffffff;
  intensity = 1;
  distance = 0;
  angle = 60;
  penumbra = 0.1;
  decay = 1.0;
  target = new THREE.Vector3(0, 0, 0);
  castShadow = false;

  shadow = {
    mapSize: new THREE.Vector2(512, 512),
    bias: 0,

    camera: {
      near: 0.1,
      far: 100,
      focus: 1,
      left: -100,
      right: 100,
      top: 100,
      bottom: -100
    }
  };

  constructor(actor: SupEngine.Actor) {
    super(actor, "Light");

    this.actor.gameInstance.threeRenderer.shadowMap.enabled = true;
  }

  setType(type: string) {
    if (this.light != null) this.actor.threeObject.remove(this.light);
    this.type = type;

    switch (type) {
      case "ambient":
        this.light = new THREE.AmbientLight(this.color);
        break;
      case "point":
        this.light = new THREE.PointLight(this.color, this.intensity, this.distance);
        break;
      case "spot":
        const spotLight = new THREE.SpotLight(this.color, this.intensity, this.distance, this.angle * Math.PI / 360, this.penumbra, this.decay);
        spotLight.target.position.copy(this.target);
        spotLight.target.updateMatrixWorld(false);
        spotLight.shadow.mapSize.copy(this.shadow.mapSize);
        spotLight.shadow.bias = this.shadow.bias;
        spotLight.shadow.mapSize.width = this.shadow.mapSize.x;
        spotLight.shadow.mapSize.height = this.shadow.mapSize.y;
        spotLight.shadow.camera.near = this.shadow.camera.near;
        spotLight.shadow.camera.far = this.shadow.camera.far;
        spotLight.shadow.focus = this.shadow.camera.focus;
        spotLight.shadow.updateMatrices(spotLight);

        this.light = spotLight;
        this.setCastShadow(this.castShadow);
        break;
      case "directional":
        const directionalLight = new THREE.DirectionalLight(this.color, this.intensity);
        directionalLight.target.position.copy(this.target);
        directionalLight.target.updateMatrixWorld(false);
        directionalLight.shadow.mapSize.copy(this.shadow.mapSize);
        directionalLight.shadow.bias = this.shadow.bias;
        directionalLight.shadow.camera = new THREE.OrthographicCamera(
          this.shadow.camera.left, this.shadow.camera.right,
          this.shadow.camera.top, this.shadow.camera.bottom,
          this.shadow.camera.near, this.shadow.camera.far);
        this.light = directionalLight;
        this.setCastShadow(this.castShadow);
        break;
    }
    this.actor.threeObject.add(this.light);
    this.light.position.set(0, 0, 0);
    this.light.updateMatrixWorld(false);

    this.actor.gameInstance.threeScene.traverse((object: any) => {
      const material: THREE.Material = object.material;
      if (material != null) material.needsUpdate = true;
    });
  }

  setColor(color: number) {
    this.color = color;
    this.light.color.setHex(this.color);
  }

  setIntensity(intensity: number) {
    this.intensity = intensity;
    if (this.type !== "ambient") (<THREE.PointLight>this.light).intensity = intensity;
  }

  setDistance(distance: number) {
    this.distance = distance;
    if (this.type === "point" || this.type === "spot") (<THREE.PointLight>this.light).distance = distance;
  }

  setAngle(angle: number) {
    this.angle = angle;
    if (this.type !== "spot") return;

    const light = (this.light as THREE.SpotLight);
    light.angle = this.angle * Math.PI / 360;
    light.shadow.updateMatrices(light);
  }

  setPenumbra(penumbra: number) {
    this.penumbra = penumbra;
    if (this.type === "spot") (<THREE.SpotLight>this.light).penumbra = this.penumbra;
  }

  setDecay(decay: number) {
    this.decay = decay;
    if (this.type === "spot") (<THREE.SpotLight>this.light).decay = this.decay;
  }

  setTarget(x: number, y: number, z: number) {
    if (x != null) this.target.setX(x);
    if (y != null) this.target.setY(y);
    if (z != null) this.target.setZ(z);
    if (this.type === "spot" || this.type === "directional") {
      (<THREE.SpotLight>this.light).target.position.copy(this.target);
      (<THREE.SpotLight>this.light).target.updateMatrixWorld(true);
    }
  }

  setCastShadow(castShadow: boolean) {
    this.castShadow = castShadow;
    if (this.type !== "spot" && this.type !== "directional") return;

    this.light.castShadow = this.castShadow;
    this.actor.gameInstance.threeScene.traverse((object: any) => {
      const material: THREE.Material = object.material;
      if (material != null) material.needsUpdate = true;
    });
  }

  setShadowMapSize(width: number, height: number) {
    if (width != null) this.shadow.mapSize.x = width;
    if (height != null) this.shadow.mapSize.y = height;
    if (this.type !== "spot" && this.type !== "directional") return;

    const shadow = (this.light as THREE.SpotLight|THREE.DirectionalLight).shadow;
    shadow.mapSize.copy(this.shadow.mapSize);
    this.setType(this.type);
  }

  setShadowBias(bias: number) {
    this.shadow.bias = bias;
    if (this.type !== "spot" && this.type !== "directional") return;

    const shadow = (this.light as THREE.SpotLight|THREE.DirectionalLight).shadow;
    shadow.bias = this.shadow.bias;
  }

  setShadowCameraNearPlane(near: number) {
    this.shadow.camera.near = near;
    if (this.type !== "spot" && this.type !== "directional") return;

    const shadow = (this.light as THREE.SpotLight|THREE.DirectionalLight).shadow;
    const camera = <THREE.PerspectiveCamera>shadow.camera;
    camera.near = this.shadow.camera.near;
    camera.updateProjectionMatrix();
  }

  setShadowCameraFarPlane(far: number) {
    this.shadow.camera.far = far;
    if (this.type !== "spot" && this.type !== "directional") return;

    const shadow = (this.light as THREE.SpotLight|THREE.DirectionalLight).shadow;
    const camera = <THREE.PerspectiveCamera>shadow.camera;
    camera.far = this.shadow.camera.far;
    camera.updateProjectionMatrix();
  }

  setShadowCameraFocus(focus: number) {
    this.shadow.camera.focus = focus;
    if (this.type !== "spot") return;

    const shadow = (this.light as THREE.SpotLight).shadow;
    shadow.focus = this.shadow.camera.focus;
    shadow.updateMatrices(this.light);
  }

  setShadowCameraSize(top: number, bottom: number, left: number, right: number) {
    if (top != null) this.shadow.camera.top = top;
    if (bottom != null) this.shadow.camera.bottom = bottom;
    if (left != null) this.shadow.camera.left = left;
    if (right != null) this.shadow.camera.right = right;
    if (this.type !== "directional") return;

    const camera = (<THREE.OrthographicCamera>((<THREE.SpotLight>this.light).shadow.camera as any));
    camera.top = this.shadow.camera.top;
    camera.bottom = this.shadow.camera.bottom;
    camera.left = this.shadow.camera.left;
    camera.right = this.shadow.camera.right;
    camera.updateProjectionMatrix();
  }

  _destroy() {
    this.actor.threeObject.remove(this.light);
    if (this.castShadow) {
      this.actor.gameInstance.threeScene.traverse((object: any) => {
        const material: THREE.Material = object.material;
        if (material != null) material.needsUpdate = true;
      });
    }
    super._destroy();
  }

  setIsLayerActive(active: boolean) { this.light.visible = active; }
}
