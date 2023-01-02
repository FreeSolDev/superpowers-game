const THREE = SupEngine.THREE;

export default class SkyHelper extends SupEngine.ActorComponent {
  skyMesh: THREE.Mesh;
  visible = true;

  gradTexture(offset: Array<number>, color: Array<string>): THREE.Texture {
    let c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const size = 1024;
    c.width = 16; c.height = size;
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    let i = color.length;
    while (i--) { gradient.addColorStop(offset[i], color[i]); }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, size);
    let texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
  }


  constructor(actor: SupEngine.Actor) {
    super(actor, "SkyHelper");

    this.setup();
  }

  setIsLayerActive(active: boolean) { this.skyMesh.visible = active && this.visible; }

  setup() {
    if (this.skyMesh != null) {
      this.actor.threeObject.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
      (this.skyMesh.material as THREE.Material).dispose();
    }

    const buffgeoBackground = new THREE.IcosahedronGeometry(500, 2);
    const matBackground = new THREE.MeshBasicMaterial( {
        map: this.gradTexture([0.75, 0.6, 0.4, 0.25], ["#1B1D1E", "#3D4143", "#72797D", "#b0babf"]),
        side: THREE.BackSide,
        depthWrite: false, fog: false
      }
    );
    this.skyMesh = new THREE.Mesh(buffgeoBackground, matBackground);
    // this.actor.threeObject.add(this.skyMesh);
    this.actor.gameInstance.threeScene.add(this.skyMesh);
    return;

    const skyGeo = new THREE.SphereGeometry(500);
    const skyMat = new THREE.RawShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x8d8d8d) },
        bottomColor: { value: new THREE.Color(0x424242) },
        skyTopColor: { value: new THREE.Color(0x0077ff) },
        skyBottomColor: { value: new THREE.Color(0xfbf4e7) },
        exponent: { value: 0.5 }
      },
      vertexShader:
`precision mediump float;
precision mediump int;
#define SHADER_NAME SkyShader
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
      fragmentShader:
`precision mediump float;
precision mediump int;
#define SHADER_NAME SkyShader
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform vec3 skyTopColor;
uniform vec3 skyBottomColor;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize(vWorldPosition).y;
  // gl_FragColor = vec4(mix(skyBottomColor, skyTopColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
  gl_FragColor = vec4(mix(bottomColor, topColor, h / 2.0 + 0.5), 1.0);
}`,
      side: THREE.BackSide
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.actor.threeObject.add(this.skyMesh);
  }

  setVisible(visible: boolean) {
    this.skyMesh.visible = this.visible = visible;
  }
}
