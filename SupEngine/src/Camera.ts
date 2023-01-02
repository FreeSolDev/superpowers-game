import * as THREE from "three";
import Actor from "./Actor";
import ActorComponent from "./ActorComponent";

export default class Camera extends ActorComponent {
  fov = 45;
  orthographicScale = 10;

  threeCamera: THREE.OrthographicCamera|THREE.PerspectiveCamera;
  unifiedThreeCamera: THREE.Camera;
  viewport = { x: 0, y: 0, width: 1, height: 1 };

  layers: number[] = [];
  depth = 0;
  nearClippingPlane = 0.1;
  farClippingPlane = 1000;

  clearColor = 0x000000;

  cachedRatio: number;
  isOrthographic: boolean;
  projectionNeedsUpdate: boolean;

  usePostProcessing: boolean;
  renderTarget: THREE.WebGLRenderTarget;
  tmpBuffer: THREE.WebGLRenderTarget;
  camPass: THREE.OrthographicCamera;
  scenePass: THREE.Scene;
  quadPass: THREE.Mesh;
  passes: Array<THREE.ShaderMaterial>;
  copyMat: THREE.ShaderMaterial;

  constructor(actor: Actor) {
    super(actor, "Camera");

    this.unifiedThreeCamera = <any>{
      type: "PerspectiveCamera",
      matrixWorld: null,
      projectionMatrix: null,
      updateMatrixWorld: () => { /* Nothing here */ }
    };

    this.setOrthographicMode(false);

    this.computeAspectRatio();
    this.actor.gameInstance.on("resize", this.computeAspectRatio);

    let size = new THREE.Vector2();
    this.actor.gameInstance.threeRenderer.getSize(size);
    this.renderTarget = new THREE.WebGLRenderTarget(size.width, size.height);
    this.renderTarget.texture.magFilter = THREE.NearestFilter;
    this.renderTarget.texture.minFilter = THREE.NearestFilter;
    this.tmpBuffer = this.renderTarget.clone();
    this.tmpBuffer.texture.magFilter = THREE.NearestFilter;
    this.tmpBuffer.texture.minFilter = THREE.NearestFilter;
    this.camPass = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scenePass = new THREE.Scene();
    this.quadPass = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.scenePass.add(this.quadPass);

    this.copyMat = new THREE.ShaderMaterial({
      uniforms: {
        "map": { value: null }
      },
      vertexShader:
"varying vec2 vUv;\n\
void main() {\n\
  vUv = uv;\n\
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
}",
      fragmentShader:
"uniform sampler2D map;\n\
varying vec2 vUv;\n\
void main() {\n\
  gl_FragColor = texture2D( map, vUv );\n\
}"
    });
    this.copyMat.transparent = true;
  }

  _destroy() {
    this.actor.gameInstance.removeListener("resize", this.computeAspectRatio);

    const index = this.actor.gameInstance.renderComponents.indexOf(this);
    if (index !== -1) this.actor.gameInstance.renderComponents.splice(index, 1);

    this.threeCamera = null;
    this.renderTarget.dispose();
    this.tmpBuffer.dispose();

    super._destroy();
  }

  private computeAspectRatio = () => {
    const canvas = this.actor.gameInstance.threeRenderer.domElement;
    this.cachedRatio = (canvas.clientWidth * this.viewport.width) / (canvas.clientHeight * this.viewport.height);
    this.projectionNeedsUpdate = true;
    if (this.renderTarget) {
      this.renderTarget.setSize(canvas.clientWidth * this.viewport.width, canvas.clientHeight * this.viewport.height);
      this.tmpBuffer.setSize(canvas.clientWidth * this.viewport.width, canvas.clientHeight * this.viewport.height);
    }
  }

  setIsLayerActive(active: boolean) { /* Nothing to render */ }

  setOrthographicMode(isOrthographic: boolean) {
    this.isOrthographic = isOrthographic;

    if (this.isOrthographic) {
      this.threeCamera = new THREE.OrthographicCamera(-this.orthographicScale * this.cachedRatio / 2,
        this.orthographicScale * this.cachedRatio / 2,
        this.orthographicScale / 2, -this.orthographicScale / 2,
        this.nearClippingPlane, this.farClippingPlane);
    }
    else this.threeCamera = new THREE.PerspectiveCamera(this.fov, this.cachedRatio, this.nearClippingPlane, this.farClippingPlane);

    this.unifiedThreeCamera.type = isOrthographic ? "OrthographicCamera" : "PerspectiveCamera";
    this.unifiedThreeCamera.matrixWorld = this.threeCamera.matrixWorld;
    this.unifiedThreeCamera.projectionMatrix = this.threeCamera.projectionMatrix;
    this.unifiedThreeCamera.projectionMatrixInverse = this.threeCamera.projectionMatrixInverse;
    this.projectionNeedsUpdate = true;
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
    this.computeAspectRatio();
  }

  setDepth(depth: number) {
    this.depth = depth;
  }

  setNearClippingPlane(nearClippingPlane: number) {
    this.nearClippingPlane = nearClippingPlane;
    this.threeCamera.near = this.nearClippingPlane;
    this.projectionNeedsUpdate = true;
  }

  setFarClippingPlane(farClippingPlane: number) {
    this.farClippingPlane = farClippingPlane;
    this.threeCamera.far = this.farClippingPlane;
    this.projectionNeedsUpdate = true;
  }

  setClearColor(clearColor: number) {
    this.clearColor = clearColor;
  }

  setPostProcessing(use: boolean, assets: Array<any>) {
    this.usePostProcessing = use;
    if (use) {
      this.passes = [];
      for (let asset of assets) {
        let unif: { [uniform: string]: any } = [];
        unif["time"] = { value: 0 };
        for (let uniform of asset.__inner.uniforms) {
          unif[uniform.name] = { value: uniform.value };
        }

        let passMat = new THREE.ShaderMaterial({
          uniforms: unif,
          vertexShader: asset.__inner.vertexShader.text,
          fragmentShader: asset.__inner.fragmentShader.text
        });

        this.passes.push(passMat);
      }
    }
  }

  start() { this.actor.gameInstance.renderComponents.push(this); }

  render() {
    this.actor.threeObject.getWorldPosition(this.threeCamera.position);
    this.actor.threeObject.getWorldQuaternion(this.threeCamera.quaternion);

    if (this.projectionNeedsUpdate) {
      this.projectionNeedsUpdate = false;

      if (this.isOrthographic) {
        const orthographicCamera = <THREE.OrthographicCamera>this.threeCamera;
        orthographicCamera.left = -this.orthographicScale * this.cachedRatio / 2;
        orthographicCamera.right = this.orthographicScale * this.cachedRatio / 2;
        orthographicCamera.top = this.orthographicScale / 2;
        orthographicCamera.bottom = -this.orthographicScale / 2;
        orthographicCamera.updateProjectionMatrix();

        (this.unifiedThreeCamera as any).bottom = orthographicCamera.bottom;
        (this.unifiedThreeCamera as any).top = orthographicCamera.top;
        (this.unifiedThreeCamera as any).left = orthographicCamera.left;
        (this.unifiedThreeCamera as any).right = orthographicCamera.right;
      }
      else {
        const perspectiveCamera = <THREE.PerspectiveCamera>this.threeCamera;
        perspectiveCamera.fov = this.fov;
        perspectiveCamera.aspect = this.cachedRatio;
        perspectiveCamera.updateProjectionMatrix();

        (this.unifiedThreeCamera as any).fov = perspectiveCamera.fov;
      }
    }

    const canvas = this.actor.gameInstance.threeRenderer.domElement;
    this.actor.gameInstance.threeRenderer.setViewport(
      this.viewport.x * canvas.width    , (1 - this.viewport.y - this.viewport.height) * canvas.height,
      this.viewport.width * canvas.width, this.viewport.height * canvas.height
    );

    this.actor.gameInstance.threeRenderer.setClearColor(this.clearColor);
    const target = this.usePostProcessing ? this.renderTarget : null;
    this.actor.gameInstance.threeRenderer.setRenderTarget(target);
    if (target != null) this.actor.gameInstance.threeRenderer.clear(true, true, true);
    if (this.layers.length > 0) {
      for (const layer of this.layers) {
        this.actor.gameInstance.setActiveLayer(layer);
        this.actor.gameInstance.threeRenderer.render(this.actor.gameInstance.threeScene, this.threeCamera);
      }
    } else {
      for (let layer = 0; layer < this.actor.gameInstance.layers.length; layer++) {
        this.actor.gameInstance.setActiveLayer(layer);
        this.actor.gameInstance.threeRenderer.render(this.actor.gameInstance.threeScene, this.threeCamera);
      }
    }
    this.actor.gameInstance.setActiveLayer(null);

    if (this.usePostProcessing) {
      this.actor.gameInstance.threeRenderer.setRenderTarget(this.tmpBuffer);
      this.actor.gameInstance.threeRenderer.clear(true, true, true);
      let buf1 = this.renderTarget;
      let buf2 = this.tmpBuffer;

      for (let p of this.passes) {
        if (p.uniforms["time"])
          p.uniforms["time"].value += (1.0 / this.actor.gameInstance.framesPerSecond);
        if (p.uniforms["map"])
          p.uniforms["map"].value = buf1.texture;
        if (p.uniforms["mapSize"])
          p.uniforms["mapSize"].value = new THREE.Vector2(buf1.width, buf1.height);
        this.quadPass.material = p;
        this.actor.gameInstance.threeRenderer.setRenderTarget(buf2);
        this.actor.gameInstance.threeRenderer.render(this.scenePass, this.camPass);

        let tmp = buf1;
        buf1 = buf2;
        buf2 = tmp;
      }

      this.copyMat.uniforms["map"].value = buf1.texture;

      this.quadPass.material = this.copyMat;
      this.actor.gameInstance.threeRenderer.setRenderTarget(null);
      this.actor.gameInstance.threeRenderer.render(this.scenePass, this.camPass);
    }
  }
}
