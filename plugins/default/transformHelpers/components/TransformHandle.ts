const THREE = SupEngine.THREE;
import TransformControls from "./TransformControls";

export default class TransformHandle extends SupEngine.ActorComponent {
  control: TransformControls;

  target: THREE.Object3D;
  mode = "translate";
  space = "world";
  controlVisible = false;

  constructor(actor: SupEngine.Actor, threeCamera: THREE.Camera) {
    super(actor, "TransformHandle");

    this.control = new TransformControls(threeCamera, actor.gameInstance.threeRenderer);
    this.actor.gameInstance.threeScene.add(this.control);
  }

  setIsLayerActive(active: boolean) { this.control.visible = active && this.controlVisible; }

  update() {
    this.control.updateMatrixWorld(true);
  }

  setMode(mode: string) {
    this.mode = mode;
    if (this.target != null) {
      this.control.mode = mode;
      this.control.space = this.mode === "scale" ? "local" : this.space;
    }
  }

  setSpace(space: string) {
    this.space = space;
    if (this.target != null && this.mode !== "scale") this.control.space = space;
  }

  setTarget(target: THREE.Object3D) {
    this.target = target;

    if (this.target != null) {
      this.controlVisible = true;
      this.control.attach(this.actor.threeObject);
      this.control.space = this.mode === "scale" ? "local" : this.space;
      this.control.mode = this.mode;
      this.move();
    } else {
      this.controlVisible = false;
      this.control.detach();
    }
  }

  move() {
    this.target.getWorldPosition(this.actor.threeObject.position);
    this.target.getWorldQuaternion(this.actor.threeObject.quaternion);
    this.actor.threeObject.scale.copy(this.target.scale);
    this.actor.threeObject.updateMatrixWorld(false);

    this.control.updateMatrixWorld(true);
  }

  _destroy() {
    this.controlVisible = false;
    this.control.detach();
    this.actor.gameInstance.threeScene.remove(this.control);

    super._destroy();
  }
}
