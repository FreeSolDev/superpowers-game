const THREE = SupEngine.THREE;

const _raycaster = new THREE.Raycaster();

const _tempVector = new THREE.Vector3();
const _tempVector2 = new THREE.Vector3();
const _tempQuaternion = new THREE.Quaternion();
const _unit = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
  Z: new THREE.Vector3(0, 0, 1)
};

const _changeEvent: { type: string } = { type: "change" };
const _mouseDownEvent: { type: string, mode: string } = { type: "mouseDown", mode: null };
const _mouseUpEvent: { type: string, mode: string } = { type: "mouseUp", mode: null };
const _objectChangeEvent: { type: string } = { type: "objectChange" };

interface PointerPos {
  x: number;
  y: number;
  button: number;
}

export default class TransformControls extends THREE.Object3D {
  domElement: HTMLElement;

  _gizmo: TransformControlsGizmo;
  _plane: TransformControlsPlane;

  _offset = new THREE.Vector3();
  _startNorm = new THREE.Vector3();
  _endNorm = new THREE.Vector3();
  _cameraScale = new THREE.Vector3();

  _parentPosition = new THREE.Vector3();
  _parentQuaternion = new THREE.Quaternion();
  _parentQuaternionInv = new THREE.Quaternion();
  _parentScale = new THREE.Vector3();

  _worldScaleStart = new THREE.Vector3();
  _worldQuaternionInv = new THREE.Quaternion();
  _worldScale = new THREE.Vector3();

  _positionStart = new THREE.Vector3();
  _quaternionStart = new THREE.Quaternion();
  _scaleStart = new THREE.Vector3();

  // GETTER/SETTER
  private _camera: THREE.Camera = null; get camera(): THREE.Camera { return this._camera; }
  set camera(value: THREE.Camera) {
    if (this._camera !== value) {
      this._camera = value;
      this.dispatchEvent({ type: "camera-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _object: THREE.Object3D = undefined; get object() { return this._object; }
  set object(value: THREE.Object3D) {
    if (this._object !== value) {
      this._object = value;
      this.dispatchEvent({ type: "object-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _enabled = true; get enabled() { return this._enabled; }
  set enabled(value: boolean) {
    if (this._enabled !== value) {
      this._enabled = value;
      this.dispatchEvent({ type: "enabled-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _axis: string = null; get axis() { return this._axis; }
  set axis(value: string) {
    if (this._axis !== value) {
      this._axis = value;
      this.dispatchEvent({ type: "axis-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _mode = "translate"; get mode() { return this._mode; }
  set mode(value: string) {
    if (this._mode !== value) {
      this._mode = value;
      this.dispatchEvent({ type: "mode-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _translationSnap: number = null; get translationSnap() { return this._translationSnap; }
  set translationSnap(value: number) {
    if (this._translationSnap !== value) {
      this._translationSnap = value;
      this.dispatchEvent({ type: "translationSnap-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _rotationSnap: number = null; get rotationSnap() { return this._rotationSnap; }
  set rotationSnap(value: number) {
    if (this._rotationSnap !== value) {
      this._rotationSnap = value;
      this.dispatchEvent({ type: "rotationSnap-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _scaleSnap: number = null; get scaleSnap() { return this._scaleSnap; }
  set scaleSnap(value: number) {
    if (this._scaleSnap !== value) {
      this._scaleSnap = value;
      this.dispatchEvent({ type: "scaleSnap-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _space = "world"; get space() { return this._space; }
  set space(value: string) {
    if (this._space !== value) {
      this._space = value;
      this.dispatchEvent({ type: "space-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _size = 1; get size() { return this._size; }
  set size(value: number) {
    if (this._size !== value) {
      this._size = value;
      this.dispatchEvent({ type: "size-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _dragging = false; get dragging() { return this._dragging; }
  set dragging(value: boolean) {
    if (this._dragging !== value) {
      this._dragging = value;
      this.dispatchEvent({ type: "dragging-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _showX = true; get showX() { return this._showX; }
  set showX(value: boolean) {
    if (this._showX !== value) {
      this._showX = value;
      this.dispatchEvent({ type: "showX-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _showY = true; get showY() { return this._showY; }
  set showY(value: boolean) {
    if (this._showY !== value) {
      this._showY = value;
      this.dispatchEvent({ type: "showY-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _showZ = true; get showZ() { return this._showZ; }
  set showZ(value: boolean) {
    if (this._showZ !== value) {
      this._showZ = value;
      this.dispatchEvent({ type: "showZ-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }





  private _worldPosition = new THREE.Vector3(); get worldPosition() { return this._worldPosition; }
  set worldPosition(value: THREE.Vector3) {
    if (this._worldPosition !== value) {
      this._worldPosition = value;
      this.dispatchEvent({ type: "worldPosition-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _worldPositionStart = new THREE.Vector3(); get worldPositionStart() { return this._worldPositionStart; }
  set worldPositionStart(value: THREE.Vector3) {
    if (this._worldPositionStart !== value) {
      this._worldPositionStart = value;
      this.dispatchEvent({ type: "worldPositionStart-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _worldQuaternion = new THREE.Quaternion(); get worldQuaternion() { return this._worldQuaternion; }
  set worldQuaternion(value: THREE.Quaternion) {
    if (this._worldQuaternion !== value) {
      this._worldQuaternion = value;
      this.dispatchEvent({ type: "worldQuaternion-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _worldQuaternionStart = new THREE.Quaternion(); get worldQuaternionStart() { return this._worldQuaternionStart; }
  set worldQuaternionStart(value: THREE.Quaternion) {
    if (this._worldQuaternionStart !== value) {
      this._worldQuaternionStart = value;
      this.dispatchEvent({ type: "worldQuaternionStart-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _cameraPosition = new THREE.Vector3(); get cameraPosition() { return this._cameraPosition; }
  set cameraPosition(value: THREE.Vector3) {
    if (this._cameraPosition !== value) {
      this._cameraPosition = value;
      this.dispatchEvent({ type: "cameraPosition-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _cameraQuaternion = new THREE.Quaternion(); get cameraQuaternion() { return this._cameraQuaternion; }
  set cameraQuaternion(value: THREE.Quaternion) {
    if (this._cameraQuaternion !== value) {
      this._cameraQuaternion = value;
      this.dispatchEvent({ type: "cameraQuaternion-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _pointStart = new THREE.Vector3(); get pointStart() { return this._pointStart; }
  set pointStart(value: THREE.Vector3) {
    if (this._pointStart !== value) {
      this._pointStart = value;
      this.dispatchEvent({ type: "pointStart-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _pointEnd = new THREE.Vector3(); get pointEnd() { return this._pointEnd; }
  set pointEnd(value: THREE.Vector3) {
    if (this._pointEnd !== value) {
      this._pointEnd = value;
      this.dispatchEvent({ type: "pointEnd-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _rotationAxis = new THREE.Vector3(); get rotationAxis() { return this._rotationAxis; }
  set rotationAxis(value: THREE.Vector3) {
    if (this._rotationAxis !== value) {
      this._rotationAxis = value;
      this.dispatchEvent({ type: "rotationAxis-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _rotationAngle = 0; get rotationAngle() { return this._rotationAngle; }
  set rotationAngle(value: number) {
    if (this._rotationAngle !== value) {
      this._rotationAngle = value;
      this.dispatchEvent({ type: "rotationAngle-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }
  private _eye = new THREE.Vector3(); get eye() { return this._eye; }
  set eye(value: THREE.Vector3) {
    if (this._eye !== value) {
      this._eye = value;
      this.dispatchEvent({ type: "eye-changed", value: value }); this.dispatchEvent(_changeEvent);
    }
  }

  constructor(camera: THREE.Camera, renderer: THREE.Renderer) {
    super();

    this.visible = false;
    this.domElement = renderer.domElement;
    this.domElement.style.touchAction = "none"; // disable touch scroll

    const _gizmo = new TransformControlsGizmo(this);
    this._gizmo = _gizmo;
    this.add(_gizmo);

    const _plane = new TransformControlsPlane(this);
    this._plane = _plane;
    this.add(_plane);

    this._camera = camera;

    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointermove", this._onPointerHover);
    this.domElement.addEventListener("pointerup", this._onPointerUp);
  }

  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld(force?: boolean) {
    if (this.object !== undefined) {
      this.object.updateMatrixWorld();

      if (this.object.parent === null)
        console.error("TransformControls: The attached 3D object must be a part of the scene graph.");
      else
        this.object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale);

      this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this._worldScale);

      this._parentQuaternionInv.copy(this._parentQuaternion).invert();
      this._worldQuaternionInv.copy(this.worldQuaternion).invert();
    }

    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale);

    if (this.camera.type === "OrthographicCamera")
      this.camera.getWorldDirection(this.eye);
    else
      this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();

    super.updateMatrixWorld(force);
  }

  pointerHover(pointer: PointerPos) {
    if (this.object === undefined || this.dragging === true) return;

    _raycaster.setFromCamera(pointer, this.camera);
    const intersect = intersectObjectWithRay(this._gizmo.picker[this.mode], _raycaster);
    if (intersect)
      this.axis = intersect.object.name;
    else
      this.axis = null;
  }

  pointerDown(pointer: PointerPos) {
    if (this.object === undefined || this.dragging === true || pointer.button !== 0) return;

    if (this.axis !== null) {
      _raycaster.setFromCamera(pointer, this.camera);

      const planeIntersect = intersectObjectWithRay(this._plane, _raycaster, true);

      if (planeIntersect) {
        this.object.updateMatrixWorld();
        this.object.parent.updateMatrixWorld();

        this._positionStart.copy(this.object.position);
        this._quaternionStart.copy(this.object.quaternion);
        this._scaleStart.copy(this.object.scale);

        this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart);

        this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart);
      }

      this.dragging = true;
      _mouseDownEvent.mode = this.mode;
      this.dispatchEvent(_mouseDownEvent);
    }
  }

  pointerMove(pointer: PointerPos) {
    const axis = this.axis;
    const mode = this.mode;
    const object = this.object;
    if (object === undefined || axis === null || this.dragging === false || pointer.button !== - 1) return;

    let space = this.space;
    if (mode === "scale")
      space = "local";
    else if (axis === "E" || axis === "XYZE" || axis === "XYZ")
      space = "world";

    _raycaster.setFromCamera(pointer, this.camera);
    const planeIntersect = intersectObjectWithRay(this._plane, _raycaster, true);
    if (!planeIntersect) return;

    this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

    if (mode === "translate") {
      // Apply translate

      this._offset.copy(this.pointEnd).sub(this.pointStart);

      if (space === "local" && axis !== "XYZ") {
        this._offset.applyQuaternion(this._worldQuaternionInv);
      }

      if (axis.indexOf("X") === - 1) this._offset.x = 0;
      if (axis.indexOf("Y") === - 1) this._offset.y = 0;
      if (axis.indexOf("Z") === - 1) this._offset.z = 0;

      if (space === "local" && axis !== "XYZ") {
        this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale);
      } else {
        this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale);
      }

      object.position.copy(this._offset).add(this._positionStart);

      // Apply translation snap

      if (this.translationSnap) {
        if (space === "local") {
          object.position.applyQuaternion(_tempQuaternion.copy(this._quaternionStart).invert());

          if (axis.search("X") !== - 1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }

          if (axis.search("Y") !== - 1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }

          if (axis.search("Z") !== - 1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }

          object.position.applyQuaternion(this._quaternionStart);
        }

        if (space === "world") {
          if (object.parent) {
            object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
          }

          if (axis.search("X") !== - 1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }

          if (axis.search("Y") !== - 1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }

          if (axis.search("Z") !== - 1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }

          if (object.parent) {
            object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
          }
        }
      }
    } else if (mode === "scale") {
      if (axis.search("XYZ") !== - 1) {
        let d = this.pointEnd.length() / this.pointStart.length();

        if (this.pointEnd.dot(this.pointStart) < 0) d *= - 1;

        _tempVector2.set(d, d, d);
      } else {
        _tempVector.copy(this.pointStart);
        _tempVector2.copy(this.pointEnd);

        _tempVector.applyQuaternion(this._worldQuaternionInv);
        _tempVector2.applyQuaternion(this._worldQuaternionInv);

        _tempVector2.divide(_tempVector);

        if (axis.search("X") === - 1)
          _tempVector2.x = 1;

        if (axis.search("Y") === - 1)
          _tempVector2.y = 1;
        if (axis.search("Z") === - 1)
          _tempVector2.z = 1;
      }

      // Apply scale
      object.scale.copy(this._scaleStart).multiply(_tempVector2);

      if (this.scaleSnap) {
        if (axis.search("X") !== - 1)
          object.scale.x = Math.round(object.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap;

        if (axis.search("Y") !== - 1)
          object.scale.y = Math.round(object.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap;

        if (axis.search("Z") !== - 1)
          object.scale.z = Math.round(object.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
      }
    } else if (mode === "rotate") {
      this._offset.copy(this.pointEnd).sub(this.pointStart);

      const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld));
      if (axis === "E") {
        this.rotationAxis.copy(this.eye);
        this.rotationAngle = this.pointEnd.angleTo(this.pointStart);

        this._startNorm.copy(this.pointStart).normalize();
        this._endNorm.copy(this.pointEnd).normalize();

        this.rotationAngle *= (this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : - 1);
      } else if (axis === "XYZE") {
        this.rotationAxis.copy(this._offset).cross(this.eye).normalize();
        this.rotationAngle = this._offset.dot(_tempVector.copy(this.rotationAxis).cross(this.eye)) * ROTATION_SPEED;
      } else if (axis === "X" || axis === "Y" || axis === "Z") {
        this.rotationAxis.copy(_unit[axis]);

        _tempVector.copy(_unit[axis]);

        if (space === "local")
          _tempVector.applyQuaternion(this.worldQuaternion);

        this.rotationAngle = this._offset.dot(_tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
      }

      // Apply rotation snap
      if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

      // Apply rotate
      if (space === "local" && axis !== "E" && axis !== "XYZE") {
        object.quaternion.copy(this._quaternionStart);
        object.quaternion.multiply(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize();
      } else {
        this.rotationAxis.applyQuaternion(this._parentQuaternionInv);
        object.quaternion.copy(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
        object.quaternion.multiply(this._quaternionStart).normalize();
      }
    }

    this.dispatchEvent(_changeEvent);
    this.dispatchEvent(_objectChangeEvent);
  }

  pointerUp(pointer: PointerPos) {
    if (pointer.button !== 0) return;

    if (this.dragging && (this.axis !== null)) {
      _mouseUpEvent.mode = this.mode;
      this.dispatchEvent(_mouseUpEvent);
    }

    this.dragging = false;
    this.axis = null;
  }

  dispose() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    this.domElement.removeEventListener("pointermove", this._onPointerHover);
    this.domElement.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.removeEventListener("pointerup", this._onPointerUp);

    this.traverse(function (child) {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
  }

  // Set current object
  attach(object: THREE.Object3D) {
    this.object = object;
    this.visible = true;

    return this;
  }

  // Detatch from object
  detach() {
    this.object = undefined;
    this.visible = false;
    this.axis = null;

    return this;
  }

  reset() {
    if (!this.enabled) return;

    if (this.dragging) {
      this.object.position.copy(this._positionStart);
      this.object.quaternion.copy(this._quaternionStart);
      this.object.scale.copy(this._scaleStart);

      this.dispatchEvent(_changeEvent);
      this.dispatchEvent(_objectChangeEvent);

      this.pointStart.copy(this.pointEnd);
    }
  }

  getRaycaster() {
    return _raycaster;
  }

  update() {
    console.warn("THREE.TransformControls: update function has no more functionality and therefore has been deprecated.");
  }

  // mouse event handlers
  _onPointerHover = this.onPointerHover.bind(this);
  _onPointerDown = this.onPointerDown.bind(this);
  _onPointerMove = this.onPointerMove.bind(this);
  _onPointerUp = this.onPointerUp.bind(this);
  getPointer(event: PointerEvent): PointerPos {
    if (this.domElement.ownerDocument.pointerLockElement)
      return { x: 0, y: 0, button: event.button };

    const rect = this.domElement.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * 2 - 1,
      y: - (event.clientY - rect.top) / rect.height * 2 + 1,
      button: event.button
    };
  }

  onPointerHover(event: PointerEvent) {
    if (!this.enabled) return;

    switch (event.pointerType) {
      case "mouse":
      case "pen":
        this.pointerHover(this.getPointer(event));
        break;
    }
  }

  onPointerDown(event: PointerEvent) {
    if (!this.enabled) return;

    if (!document.pointerLockElement)
      this.domElement.setPointerCapture(event.pointerId);
    this.domElement.addEventListener("pointermove", this._onPointerMove);

    this.pointerHover(this.getPointer(event));
    this.pointerDown(this.getPointer(event));
  }

  onPointerMove(event: PointerEvent) {
    if (!this.enabled) return;

    this.pointerMove(this.getPointer(event));
  }

  onPointerUp(event: PointerEvent) {
    if (!this.enabled) return;

    this.domElement.releasePointerCapture(event.pointerId);
    this.domElement.removeEventListener("pointermove", this._onPointerMove);

    this.pointerUp(this.getPointer(event));
  }
}

function intersectObjectWithRay(object: THREE.Object3D, raycaster: THREE.Raycaster, includeInvisible: boolean = false) {
  const allIntersections = raycaster.intersectObject(object, true);
  for (let i = 0; i < allIntersections.length; i++)
    if (allIntersections[i].object.visible || includeInvisible)
      return allIntersections[i];
  return false;
}

// Reusable utility variables

const _tempEuler = new THREE.Euler();
const _alignVector = new THREE.Vector3(0, 1, 0);
const _zeroVector = new THREE.Vector3(0, 0, 0);
const _lookAtMatrix = new THREE.Matrix4();
const _tempQuaternion2 = new THREE.Quaternion();
const _identityQuaternion = new THREE.Quaternion();

const _unitX = new THREE.Vector3(1, 0, 0);
const _unitY = new THREE.Vector3(0, 1, 0);
const _unitZ = new THREE.Vector3(0, 0, 1);

class TransformControlsGizmo extends THREE.Object3D {
  gizmo: { [type: string]: THREE.Object3D } = {};
  picker: { [type: string]: THREE.Object3D } = {};
  helper: { [type: string]: THREE.Object3D } = {};

  ctrl: TransformControls;

  constructor(ctrl: TransformControls) {
    super();

    this.ctrl = ctrl;

    this.type = "TransformControlsGizmo";

    // shared materials

    const gizmoMaterial = new THREE.MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true,
    });

    const gizmoLineMaterial = new THREE.LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    });

    // Make unique material for each axis/color

    function makeMat(hex: number, opacity?: number) {
      const mat = gizmoMaterial.clone() as THREE.MeshBasicMaterial;
      mat.color.setHex(hex);
      if (opacity) mat.opacity = opacity;
      return mat;
    }

    const matInvisible = makeMat(0xffffff, 0.15);

    const matHelper = gizmoLineMaterial.clone();
    matHelper.opacity = 0.5;

    const matRed = makeMat(0xff0000);
    const matGreen = makeMat(0x00ff00);
    const matBlue = makeMat(0x0000ff);
    const matRedTransparent = makeMat(0xff0000, 0.5);
    const matGreenTransparent = makeMat(0x00ff00, 0.5);
    const matBlueTransparent = makeMat(0x0000ff, 0.5);

    const matYellow = makeMat(0xffff00);
    const matCyan = makeMat(0x00ffff);
    const matMagenta = makeMat(0xff00ff);
    const matYellowTransparent = makeMat(0xffff00, 0.25);
    const matCyanTransparent = makeMat(0x00ffff, 0.25);
    const matMagentaTransparent = makeMat(0xff00ff, 0.25);

    const matWhiteTransparent = makeMat(0xffffff, 0.25);
    const matGray = makeMat(0x787878);

    // reusable geometry

    const arrowGeometry = new THREE.CylinderGeometry(0, 0.04, 0.1, 12);
    arrowGeometry.translate(0, 0.05, 0);

    const scaleHandleGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    scaleHandleGeometry.translate(0, 0.04, 0);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));

    const lineGeometry2 = new THREE.CylinderGeometry(0.0075, 0.0075, 0.5, 3);
    lineGeometry2.translate(0, 0.25, 0);

    const lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));

    const lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));

    const lineZGeometry = new THREE.BufferGeometry();
    lineZGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3));

    function CircleGeometry(radius: number, arc: number) {
      const geometry = new THREE.TorusGeometry(radius, 0.0075, 3, 64, arc * Math.PI * 2);
      geometry.rotateY(Math.PI / 2);
      geometry.rotateX(Math.PI / 2);
      return geometry;
    }

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    function TranslateHelperGeometry() {
      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));

      return geometry;
    }

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

    const gizmoTranslate = {
      X: [
        [new THREE.Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, - Math.PI / 2]],
        [new THREE.Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, - Math.PI / 2]]
      ],
      Y: [
        [new THREE.Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
        [new THREE.Mesh(lineGeometry2, matGreen)]
      ],
      Z: [
        [new THREE.Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new THREE.Mesh(lineGeometry2, matBlue), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0]]
      ],
      XY: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.15, 0.15), matYellowTransparent.clone()), [0.075, 0.075, 0]],
        [new THREE.Line(lineXGeometry, matYellow.clone()), [0, 0.15, 0], null, [0.15, 1, 1]],
        [new THREE.Line(lineYGeometry, matYellow.clone()), [0.15, 0, 0], null, [1, 0.15, 1]]
      ],
      YZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.15, 0.15), matCyanTransparent.clone()), [0, 0.075, 0.075], [0, Math.PI / 2, 0]],
        [new THREE.Line(lineYGeometry, matCyan.clone()), [0, 0, 0.15], null, [1, 0.15, 1]],
        [new THREE.Line(lineZGeometry, matCyan.clone()), [0, 0.15, 0], null, [1, 1, 0.15]]
      ],
      XZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.15, 0.15), matMagentaTransparent.clone()), [0.075, 0, 0.075], [- Math.PI / 2, 0, 0]],
        [new THREE.Line(lineXGeometry, matMagenta.clone()), [0, 0, 0.15], null, [0.15, 1, 1]],
        [new THREE.Line(lineZGeometry, matMagenta.clone()), [0.15, 0, 0], null, [1, 1, 0.15]]
      ]
    };

    const pickerTranslate = {
      X: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, - Math.PI / 2]]
      ],
      Y: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0, 0.3, 0]]
      ],
      Z: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), matInvisible)]
      ],
      XY: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.18, 0.18), matInvisible), [0.09, 0.09, 0]]
      ],
      YZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.18, 0.18), matInvisible), [0, 0.09, 0.09], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.18, 0.18), matInvisible), [0.09, 0, 0.09], [- Math.PI / 2, 0, 0]]
      ]
    };

    const helperTranslate = {
      START: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.01, 2), matHelper), null, null, null, "helper"]
      ],
      END: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.01, 2), matHelper), null, null, null, "helper"]
      ],
      DELTA: [
        [new THREE.Line(TranslateHelperGeometry(), matHelper), null, null, null, "helper"]
      ],
      X: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [- 1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [0, - 1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [0, 0, - 1e3], [0, - Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };

    const gizmoRotate = {
      XYZE: [
        [new THREE.Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]
      ],
      X: [
        [new THREE.Mesh(CircleGeometry(0.5, 0.5), matRed)]
      ],
      Y: [
        [new THREE.Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, - Math.PI / 2]]
      ],
      Z: [
        [new THREE.Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]
      ],
      E: [
        [new THREE.Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]
      ]
    };

    const helperRotate = {
      AXIS: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [- 1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    };

    const pickerRotate = {
      XYZE: [
        [new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), matInvisible)]
      ],
      X: [
        [new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 4, 24), matInvisible), [0, 0, 0], [0, - Math.PI / 2, - Math.PI / 2]],
      ],
      Y: [
        [new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]],
      ],
      Z: [
        [new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 4, 24), matInvisible), [0, 0, 0], [0, 0, - Math.PI / 2]],
      ],
      E: [
        [new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 2, 24), matInvisible)]
      ]
    };

    const gizmoScale = {
      X: [
        [new THREE.Mesh(scaleHandleGeometry, matRed), [0.5, 0, 0], [0, 0, - Math.PI / 2]],
        [new THREE.Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, - Math.PI / 2]],
      ],
      Y: [
        [new THREE.Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
        [new THREE.Mesh(lineGeometry2, matGreen)],
      ],
      Z: [
        [new THREE.Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new THREE.Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
      ],
      XY: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [- Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())],
      ]
    };

    const pickerScale = {
      X: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, - Math.PI / 2]]
      ],
      Y: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0, 0.3, 0]]
      ],
      Z: [
        [new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]],
      ],
      YZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
      ],
      XZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [- Math.PI / 2, 0, 0]],
      ],
      XYZ: [
        [new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), matInvisible), [0, 0, 0]],
      ]
    };

    const helperScale = {
      X: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [- 1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [0, - 1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new THREE.Line(lineGeometry, matHelper.clone()), [0, 0, - 1e3], [0, - Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };

    // Creates an Object3D with gizmos described in custom hierarchy definition.

    function setupGizmo(gizmoMap: { [axis: string]: Array<Array<any>> }): THREE.Object3D {
      const gizmo = new THREE.Object3D();

      for (const name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--;) {
          const object = gizmoMap[name][i][0].clone() as THREE.Mesh | THREE.Line;
          const position = gizmoMap[name][i][1];
          const rotation = gizmoMap[name][i][2];
          const scale = gizmoMap[name][i][3];
          const tag = gizmoMap[name][i][4];

          // name and tag properties are essential for picking and updating logic.
          object.name = name;
          object.userData["tag"] = tag;

          if (position)
            object.position.set(position[0], position[1], position[2]);

          if (rotation)
            object.rotation.set(rotation[0], rotation[1], rotation[2]);

          if (scale)
            object.scale.set(scale[0], scale[1], scale[2]);

          object.updateMatrix();

          const tempGeometry = object.geometry.clone();
          tempGeometry.applyMatrix4(object.matrix);
          object.geometry = tempGeometry;
          object.renderOrder = Infinity;

          object.position.set(0, 0, 0);
          object.rotation.set(0, 0, 0);
          object.scale.set(1, 1, 1);

          gizmo.add(object);
        }
      }

      return gizmo;
    }

    // Gizmo creation
    this.add(this.gizmo["translate"] = setupGizmo(gizmoTranslate));
    this.add(this.gizmo["rotate"] = setupGizmo(gizmoRotate));
    this.add(this.gizmo["scale"] = setupGizmo(gizmoScale));
    this.add(this.picker["translate"] = setupGizmo(pickerTranslate));
    this.add(this.picker["rotate"] = setupGizmo(pickerRotate));
    this.add(this.picker["scale"] = setupGizmo(pickerScale));
    this.add(this.helper["translate"] = setupGizmo(helperTranslate));
    this.add(this.helper["rotate"] = setupGizmo(helperRotate));
    this.add(this.helper["scale"] = setupGizmo(helperScale));

    // Pickers should be hidden always
    this.picker["translate"].visible = false;
    this.picker["rotate"].visible = false;
    this.picker["scale"].visible = false;
  }

  // updateMatrixWorld will update transformations and appearance of individual handles
  updateMatrixWorld(force: boolean) {
    // Show only gizmos for current transform mode
    this.gizmo["translate"].visible = this.ctrl.mode === "translate";
    this.gizmo["rotate"].visible = this.ctrl.mode === "rotate";
    this.gizmo["scale"].visible = this.ctrl.mode === "scale";

    this.helper["translate"].visible = this.ctrl.mode === "translate";
    this.helper["rotate"].visible = this.ctrl.mode === "rotate";
    this.helper["scale"].visible = this.ctrl.mode === "scale";

    let handles: THREE.Object3D[] = [];
    handles = handles.concat(this.picker[this.ctrl.mode].children);
    handles = handles.concat(this.gizmo[this.ctrl.mode].children);
    handles = handles.concat(this.helper[this.ctrl.mode].children);

    const space = (this.ctrl.mode === "scale") ? "local" : this.ctrl.space; // scale always oriented to local rotation
    const quaternion = (space === "local") ? this.ctrl.worldQuaternion : _identityQuaternion;
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      // hide aligned to camera
      handle.visible = true;
      handle.rotation.set(0, 0, 0);
      handle.position.copy(this.ctrl.worldPosition);

      let factor;
      if (this.ctrl.camera.type === "OrthographicCamera")
        factor = ((this.ctrl.camera as any).top - (this.ctrl.camera as any).bottom) / (this.ctrl.camera as any).zoom;
      else
        factor = this.ctrl.worldPosition.distanceTo(this.ctrl.cameraPosition) * Math.min(1.9 * Math.tan(Math.PI * (this.ctrl.camera as any).fov / 360) / (this.ctrl.camera as any).zoom, 7);

      handle.scale.set(1, 1, 1).multiplyScalar(factor * this.ctrl.size / 4);

      // TODO: simplify helpers and consider decoupling from gizmo

      if (handle.userData["tag"] === "helper") {
        handle.visible = false;

        if (handle.name === "AXIS") {
          handle.position.copy(this.ctrl.worldPositionStart);
          handle.visible = !!this.ctrl.axis;

          if (this.ctrl.axis === "X") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);

            if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.ctrl.eye)) > 0.9)
              handle.visible = false;
          }

          if (this.ctrl.axis === "Y") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);

            if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.ctrl.eye)) > 0.9)
              handle.visible = false;
          }

          if (this.ctrl.axis === "Z") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);

            if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.ctrl.eye)) > 0.9)
              handle.visible = false;
          }

          if (this.ctrl.axis === "XYZE") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0));
            _alignVector.copy(this.ctrl.rotationAxis);
            handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_zeroVector, _alignVector, _unitY));
            handle.quaternion.multiply(_tempQuaternion);
            handle.visible = this.ctrl.dragging;
          }

          if (this.ctrl.axis === "E")
            handle.visible = false;
        } else if (handle.name === "START") {
          handle.position.copy(this.ctrl.worldPositionStart);
          handle.visible = this.ctrl.dragging;
        } else if (handle.name === "END") {
          handle.position.copy(this.ctrl.worldPosition);
          handle.visible = this.ctrl.dragging;
        } else if (handle.name === "DELTA") {
          handle.position.copy(this.ctrl.worldPositionStart);
          handle.quaternion.copy(this.ctrl.worldQuaternionStart);
          _tempVector.set(1e-10, 1e-10, 1e-10).add(this.ctrl.worldPositionStart).sub(this.ctrl.worldPosition).multiplyScalar(- 1);
          _tempVector.applyQuaternion(this.ctrl.worldQuaternionStart.clone().invert());
          handle.scale.copy(_tempVector);
          handle.visible = this.ctrl.dragging;
        } else {
          handle.quaternion.copy(quaternion);

          if (this.ctrl.dragging)
            handle.position.copy(this.ctrl.worldPositionStart);
          else
            handle.position.copy(this.ctrl.worldPosition);

          if (this.ctrl.axis)
            handle.visible = this.ctrl.axis.search(handle.name) !== - 1;
        }

        // If updating helper, skip rest of the loop
        continue;
      }

      // Align handles to current local or world rotation

      handle.quaternion.copy(quaternion);

      if (this.ctrl.mode === "translate" || this.ctrl.mode === "scale") {
        // Hide translate and scale axis facing the camera

        const AXIS_HIDE_TRESHOLD = 0.99;
        const PLANE_HIDE_TRESHOLD = 0.2;

        if (handle.name === "X") {
          if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.ctrl.eye)) > AXIS_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }

        if (handle.name === "Y") {
          if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.ctrl.eye)) > AXIS_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }

        if (handle.name === "Z") {
          if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.ctrl.eye)) > AXIS_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }

        if (handle.name === "XY") {
          if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.ctrl.eye)) < PLANE_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }

        if (handle.name === "YZ") {
          if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.ctrl.eye)) < PLANE_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }

        if (handle.name === "XZ") {
          if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.ctrl.eye)) < PLANE_HIDE_TRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
      } else if (this.ctrl.mode === "rotate") {
        // Align handles to current local or world rotation

        _tempQuaternion2.copy(quaternion);
        _alignVector.copy(this.ctrl.eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert());

        if (handle.name.search("E") !== - 1) {
          handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(this.ctrl.eye, _zeroVector, _unitY));
        }

        if (handle.name === "X") {
          _tempQuaternion.setFromAxisAngle(_unitX, Math.atan2(- _alignVector.y, _alignVector.z));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }

        if (handle.name === "Y") {
          _tempQuaternion.setFromAxisAngle(_unitY, Math.atan2(_alignVector.x, _alignVector.z));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }

        if (handle.name === "Z") {
          _tempQuaternion.setFromAxisAngle(_unitZ, Math.atan2(_alignVector.y, _alignVector.x));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }
      }

      // Hide disabled axes
      handle.visible = handle.visible && (handle.name.indexOf("X") === - 1 || this.ctrl.showX);
      handle.visible = handle.visible && (handle.name.indexOf("Y") === - 1 || this.ctrl.showY);
      handle.visible = handle.visible && (handle.name.indexOf("Z") === - 1 || this.ctrl.showZ);
      handle.visible = handle.visible && (handle.name.indexOf("E") === - 1 || (this.ctrl.showX && this.ctrl.showY && this.ctrl.showZ));

      // highlight selected axis

      if (handle instanceof THREE.Mesh || handle instanceof THREE.Line) {
        handle.material._color = handle.material._color || handle.material.color.clone();
        handle.material._opacity = handle.material._opacity || handle.material.opacity;

        handle.material.color.copy(handle.material._color);
        handle.material.opacity = handle.material._opacity;

        if (this.ctrl.enabled && this.ctrl.axis) {
          if (handle.name === this.ctrl.axis) {
            handle.material.color.setHex(0xffff00);
            handle.material.opacity = 1.0;
          } else if (this.ctrl.axis.split("").some(function (a) {
            return handle.name === a;
          })) {
            handle.material.color.setHex(0xffff00);
            handle.material.opacity = 1.0;
          }
        }
      }
    }

    super.updateMatrixWorld(force);
  }
}

//

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _dirVector = new THREE.Vector3();
const _tempMatrix = new THREE.Matrix4();
class TransformControlsPlane extends THREE.Mesh {
  ctrl: TransformControls;

  constructor(ctrl: TransformControls) {
    super(
      new THREE.PlaneGeometry(100000, 100000, 2, 2),
      new THREE.MeshBasicMaterial({ visible: false, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1, toneMapped: false })
    );

    this.ctrl = ctrl;

    this.type = "TransformControlsPlane";
  }

  updateMatrixWorld(force: boolean) {
    let space = this.ctrl.space;

    this.position.copy(this.ctrl.worldPosition);

    if (this.ctrl.mode === "scale") space = "local"; // scale always oriented to local rotation

    _v1.copy(_unitX).applyQuaternion(space === "local" ? this.ctrl.worldQuaternion : _identityQuaternion);
    _v2.copy(_unitY).applyQuaternion(space === "local" ? this.ctrl.worldQuaternion : _identityQuaternion);
    _v3.copy(_unitZ).applyQuaternion(space === "local" ? this.ctrl.worldQuaternion : _identityQuaternion);

    // Align the plane for current transform mode, axis and space.

    _alignVector.copy(_v2);

    switch (this.ctrl.mode) {
      case "translate":
      case "scale":
        switch (this.ctrl.axis) {
          case "X":
            _alignVector.copy(this.ctrl.eye).cross(_v1);
            _dirVector.copy(_v1).cross(_alignVector);
            break;
          case "Y":
            _alignVector.copy(this.ctrl.eye).cross(_v2);
            _dirVector.copy(_v2).cross(_alignVector);
            break;
          case "Z":
            _alignVector.copy(this.ctrl.eye).cross(_v3);
            _dirVector.copy(_v3).cross(_alignVector);
            break;
          case "XY":
            _dirVector.copy(_v3);
            break;
          case "YZ":
            _dirVector.copy(_v1);
            break;
          case "XZ":
            _alignVector.copy(_v3);
            _dirVector.copy(_v2);
            break;
          case "XYZ":
          case "E":
            _dirVector.set(0, 0, 0);
            break;
        }

        break;
      case "rotate":
      default:
        // special case for rotate
        _dirVector.set(0, 0, 0);
    }

    if (_dirVector.length() === 0) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this.ctrl.cameraQuaternion);
    } else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector);

      this.quaternion.setFromRotationMatrix(_tempMatrix);
    }

    super.updateMatrixWorld(force);
  }
}
