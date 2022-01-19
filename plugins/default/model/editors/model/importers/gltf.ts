import * as async from "async";
import { ImportCallback, createLogError, createLogInfo, ImportLogEntry, createLogWarning } from "./index";

const THREE = SupEngine.THREE;

//#region GLTF 1
enum GLTFConst {
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126
}

interface GLTFFile {
  accessors: { [name: string]: GLTFAccessor; };
  animations: { [name: string]: any; };
  asset: GLTFAsset;
  bufferViews: { [name: string]: GLTFBufferView; };
  buffers: { [path: string]: any; };
  materials: { [name: string]: any; };
  meshes: { [name: string]: GLTFMesh; };
  nodes: { [name: string]: GLTFNode; };
  programs: { [name: string]: any; };
  scene: string;
  scenes: { [name: string]: any; };
  shaders: { [path: string]: any; };
  skins: { [name: string]: any; };
  techniques: { [name: string]: any; };
}

interface GLTFAccessor {
  bufferView: string;
  byteOffset: number;
  byteStride: number;
  componentType: number;
  count: number;
  type: string;
}

interface GLTFAsset {
  generator: string;
  premultipliedAlpha: boolean;
  profile: { api: string; version: string; };
  version: string;
}

interface GLTFBufferView {
  buffer: string;
  byteLength: number;
  byteOffset: number;
  target: number;
}

interface GLTFMesh {
  name: string;
  primitives: GLTFMeshPrimitive[];
}

enum GLTFPrimitiveMode {
  POINTS = 0,
  LINES = 1,
  LINE_LOOP = 2,
  LINE_STRIP = 3,
  TRIANGLES = 4,
  TRIANGLE_STRIP = 5,
  TRIANGLE_FAN = 6
}

interface GLTFMeshPrimitive {
  attributes?: { [name: string]: string; };
  indices?: string;
  material: string;
  mode: GLTFPrimitiveMode;
}

interface GLTFNode {
  children: string[];
  name: string;
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];

  meshes?: string[];
  skeletons?: string[];
  skin?: string;
  jointName?: string;
}
//#endregion

//#region GLTF2
enum GLTF2Const {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  UNSIGNED_INT = 5125,
  FLOAT = 5126
}

enum GLTF2Interpolation {
  LINEAR = "LINEAR",
  STEP = "STEP",
  CUBICSPLINE = "CUBICSPLINE"
}

interface GLTF2File {
  accessors?: GLTF2Accessor[];
  animations?: GLTF2Animation[];
  asset: GLTF2Asset;
  buffers?: GLTF2Buffer[];
  bufferViews?: GLTF2BufferView[];
  meshes?: GLTF2Mesh[];
  nodes?: GLTF2Node[];
  scene?: number;
  scenes?: GLTF2Scene[];
  skins?: GLTF2Skin[];
}

interface GLTF2Accessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  normalized?: boolean;
  count: number;
  type: string;
  min?: number[];
  max?: number[];
  sparse?: { [name: string]: GLTF2Sparse; };
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Animation {
  channels: GLTF2Channel[];
  samplers: GLTF2AnimationSampler[];
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Channel {
  sampler: number;
  target: GLTF2Target;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Target {
  node?: number;
  path: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2AnimationSampler {
  input: number;
  interpolation?: string;
  output: number;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Asset {
  copyright?: string;
  generator?: string;
  version: string;
  minVersion?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Buffer {
  uri?: string;
  byteLength: number;
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2BufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Mesh {
  primitives: GLTF2MeshPrimitive[];
  weights?: number[];
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2MeshPrimitive {
  attributes?: { [name: string]: number; };
  indices?: number;
  material?: number;
  mode?: GLTFPrimitiveMode;
  targets?: any;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Node {
  camera?: number;
  children?: number[];
  skin?: number;
  matrix?: number[];
  mesh?: number;
  rotation?: number[];
  scale?: number[];
  translation?: number[];
  weight?: number[];
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Scene {
  nodes?: number[];
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Skin {
  inverseBindMatrices?: number;
  skeleton?: number;
  joints?: number[];
  name?: string;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2SparseIndices {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2SparseValues {
  bufferView: number;
  byteOffset?: number;
  extensions?: { [name: string]: any; };
  extras?: any;
}

interface GLTF2Sparse {
  count: number;
  indices: { [name: string]: GLTF2SparseIndices; };
  values: { [name: string]: GLTF2SparseValues; };
  extensions?: { [name: string]: any; };
  extras?: any;
}

//#endregion

function convertAxisAngleToQuaternionArray(rotations: Float32Array, count: number) {
  const q = new THREE.Quaternion;
  const axis = new THREE.Vector3;

  for (let i = 0; i < count; i++) {
    axis.set(rotations[i * 4], rotations[i * 4 + 1], rotations[i * 4 + 2]).normalize();
    const angle = rotations[i * 4 + 3];
    q.setFromAxisAngle(axis, angle);

    rotations[i * 4] = q.x;
    rotations[i * 4 + 1] = q.y;
    rotations[i * 4 + 2] = q.z;
    rotations[i * 4 + 3] = q.w;
  }
}

function convertAxisAngleToQuaternion(rotation: number[]) {
  const q = new THREE.Quaternion;
  const axis = new THREE.Vector3;

  axis.set(rotation[0], rotation[1], rotation[2]).normalize();
  q.setFromAxisAngle(axis, rotation[3]);
  return q;
}

function getNodeMatrix(node: GLTFNode, version: string): THREE.Matrix4 {
  const matrix = new THREE.Matrix4;
  if (node.matrix != null) return matrix.fromArray(node.matrix);

  return matrix.compose(
    new THREE.Vector3(node.translation[0], node.translation[1], node.translation[2]),
    (version !== "0.8") ? new THREE.Quaternion().fromArray(node.rotation) : convertAxisAngleToQuaternion(node.rotation),
    new THREE.Vector3(node.scale[0], node.scale[1], node.scale[2])
  );
}

function getNodeMatrixGLTF2(node: GLTF2Node): THREE.Matrix4 {
  const matrix = new THREE.Matrix4;
  if (node.matrix != null) return matrix.fromArray(node.matrix);

  let translation = node.translation != null ? node.translation : [0, 0, 0];
  let rotation = node.rotation != null ? node.rotation : [0, 0, 0, 1];
  let scale = node.scale != null ? node.scale : [1, 1, 1];
  return matrix.compose(
    new THREE.Vector3(translation[0], translation[1], translation[2]),
    new THREE.Quaternion().fromArray(rotation),
    new THREE.Vector3(scale[0], scale[1], scale[2])
  );
}

export function importModel(files: File[], callback: ImportCallback) {
  let gltfFile: File = null;
  const bufferFiles: { [name: string]: File } = {};
  const imageFiles: { [name: string]: File } = {};

  for (const file of files) {
    const filename = file.name;
    const extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

    switch (extension) {
      case "gltf":
        if (gltfFile != null) { callback([ createLogError(`Cannot import multiple GLTF files at once, already found ${gltfFile.name}`, filename) ]); return; }
        gltfFile = file;
        break;

      case "bin":
        bufferFiles[filename] = file;
        break;

      case "png":
      case "jpg":
        imageFiles[filename] = file;
        break;

      default:
        callback([ createLogError(`Unsupported file type`, filename) ]);
        return;
    }
  }

  const onFileRead = (err: Error, gltf: any) => {
    if (err != null) { callback([ createLogError("Could not parse as JSON", gltfFile.name) ]); return; }

    // Used to be a number before 1.0, now it's a string, so let's normalize it
    gltf.asset.version = gltf.asset.version.toString();
    if (gltf.asset.version === "1") gltf.asset.version = "1.0";

    const gltf1Versions = [ "0.8", "1.0" ];
    if (gltf1Versions.indexOf(gltf.asset.version) !== -1) {
      onGLTFRead(gltf);
      return;
    }

    if (gltf.asset.version === "2.0") {
      onGLTF2Read(gltf);
      return;
    }
    callback([ createLogError(`Unsupported glTF format version: ${gltf.asset.version}. Supported versions are: 0.8, 1.0, 2.0.`) ], gltfFile.name);
  };

  const onGLTF2Read = (gltf: GLTF2File) => {
    if (gltf.meshes.length > 1) { callback([ createLogError("Only a single mesh is supported") ], gltfFile.name); return; }

    let logEntries: ImportLogEntry[] = [];
    logEntries.push(createLogWarning(`glTF version 2.0 WIP`, gltfFile.name));

    const buffers: { [id: number]: ArrayBuffer } = {};
    const rootNode = gltf.nodes[ gltf.scenes[gltf.scene].nodes[0] ];
    // Check if the model has its up-axis pointing in the wrong direction
    let upAxisMatrix: THREE.Matrix4 = null;

    if (rootNode.name === "Y_UP_Transform")
      upAxisMatrix = new THREE.Matrix4().fromArray(rootNode.matrix);

    let mesh: number = null;
    let skin: GLTF2Skin = null;

    const walkNode = (rootNode: GLTF2Node) => {
      if (mesh == null) {
        if (rootNode != null && rootNode.mesh != null) {
          mesh = rootNode.mesh;
          skin = gltf.skins[rootNode.skin];
        }
      }
      if (rootNode.children == null) return;
      for (const child of rootNode.children) {
        walkNode(gltf.nodes[child]);
      }
    };

    for (const rootNodeName of gltf.scenes[gltf.scene].nodes) walkNode(gltf.nodes[rootNodeName]);

    if (mesh == null && gltf.meshes.length > 0) {
      // For some reason, sometimes the mesh won't be attached to a node,
      // So let's just pick it up from gltf.meshes
      mesh = 0;
      // And look for a skin, too
      if (gltf.skins.length === 1) skin = gltf.skins[0];
    }
    if (mesh == null) { callback([ createLogError("No mesh found", gltfFile.name) ]); return; }

    const meshInfo = gltf.meshes[mesh];
    if (meshInfo.primitives.length !== 1) { callback([ createLogError("Only a single primitive is supported", gltfFile.name) ]); return; }

    let mode = meshInfo.primitives[0].mode;
    if (mode == null) mode = GLTFPrimitiveMode.TRIANGLES;
    if (mode !== GLTFPrimitiveMode.TRIANGLES) { callback([ createLogError("Only triangles are supported", gltfFile.name) ]); return; }

    async.eachOf(gltf.buffers, (bufferInfo: GLTF2Buffer, index: number, cb) => {
      // Remove path info from the URI
      let filename = decodeURI(bufferInfo.uri);
      if (filename.indexOf("/") !== -1) filename = filename.substring(filename.lastIndexOf("/") + 1);
      else if (filename.indexOf("\\") !== -1) filename = filename.substring(filename.lastIndexOf("\\") + 1);

      const bufferFile = bufferFiles[filename];
      if (bufferFile == null) { cb(new Error(`Missing buffer file: ${filename} (${bufferInfo.uri})`)); return; }

      SupClient.readFile(bufferFile, "arraybuffer", (err: Error, buffer: ArrayBuffer) => {
        if (err != null) { cb(new Error(`Could not read buffer file: ${filename} (${bufferInfo.uri})`)); return; }
        buffers[index] = buffer;
        cb(null);
      });
    }, (err: Error) => {
      if (err != null) { callback([ createLogError(err.message) ]); return; }

      const primitive = meshInfo.primitives[0];
      const attributes: { [name: string]: ArrayBuffer } = {};

      // Indices
      if (primitive.indices != null) {
        const indexAccessor: GLTF2Accessor = gltf.accessors[primitive.indices];
        if (indexAccessor.componentType !== GLTF2Const.UNSIGNED_SHORT) {
          callback([ createLogError(`Unsupported component type for index accessor: ${indexAccessor.componentType}`) ]);
          return;
        }

        const indexBufferView: GLTF2BufferView = gltf.bufferViews[indexAccessor.bufferView];
        const start =
          indexBufferView.byteOffset != null ? indexBufferView.byteOffset : 0 +
          indexAccessor.byteOffset != null ? indexAccessor.byteOffset : 0;
        attributes["index"] = buffers[indexBufferView.buffer].slice(start, start + indexAccessor.count * 2);
      }

      const positionAccessor: GLTF2Accessor = gltf.accessors[primitive.attributes["POSITION"]];
      {
        if (positionAccessor.componentType !== GLTF2Const.FLOAT) {
          callback([ createLogError(`Unsupported component type for position accessor: ${positionAccessor.componentType}`) ]);
          return;
        }

        const positionBufferView: GLTF2BufferView = gltf.bufferViews[positionAccessor.bufferView];
        const start =
          positionBufferView.byteOffset != null ? positionBufferView.byteOffset : 0 +
          positionAccessor.byteOffset != null ? positionAccessor.byteOffset : 0;
        attributes["position"] = buffers[positionBufferView.buffer].slice(start, start + positionAccessor.count * 4 * 3);
      }

      // Normal
      const normalAccessor: GLTF2Accessor = gltf.accessors[primitive.attributes["NORMAL"]];
      if (normalAccessor != null) {
        if (normalAccessor.componentType !== GLTF2Const.FLOAT) {
          callback([ createLogError(`Unsupported component type for normal accessor: ${normalAccessor.componentType}`) ]);
          return;
        }

        const normalBufferView: GLTF2BufferView = gltf.bufferViews[normalAccessor.bufferView];
        const start =
          normalBufferView.byteOffset != null ? normalBufferView.byteOffset : 0 +
          normalAccessor.byteOffset != null ? normalAccessor.byteOffset : 0;
        attributes["normal"] = buffers[normalBufferView.buffer].slice(start, start + normalAccessor.count * 4 * 3);
      }

      // UV
      const uvAccessor: GLTF2Accessor = gltf.accessors[primitive.attributes["TEXCOORD_0"]];
      if (uvAccessor != null) {
        if (uvAccessor.componentType !== GLTF2Const.FLOAT) {
          callback([ createLogError(`Unsupported component type for UV accessor: ${uvAccessor.componentType}`) ]);
          return;
        }

        const uvBufferView: GLTF2BufferView = gltf.bufferViews[uvAccessor.bufferView];
        const start =
          uvBufferView.byteOffset != null ? uvBufferView.byteOffset : 0 +
          uvAccessor.byteOffset != null ? uvAccessor.byteOffset : 0;
        const uvArray = new Float32Array(buffers[uvBufferView.buffer], start, uvAccessor.count * 2);

        for (let i = 0; i < uvAccessor.count; i++) {
          uvArray[i * 2 + 1] = 1 - uvArray[i * 2 + 1];
        }

        attributes["uv"] = buffers[uvBufferView.buffer].slice(start, start + uvAccessor.count * 4 * 2);
      }

      // Skin indices
      const skinIndexAccessor: GLTF2Accessor = gltf.accessors[primitive.attributes["JOINTS_0"]];
      if (skinIndexAccessor != null) {
        if (skinIndexAccessor.componentType !== GLTF2Const.UNSIGNED_SHORT) {
          callback([ createLogError(`Unsupported component type for skin index accessor: ${skinIndexAccessor.componentType}`) ]);
          return;
        }

        const skinIndexBufferView: GLTF2BufferView = gltf.bufferViews[skinIndexAccessor.bufferView];
        const start =
          skinIndexBufferView.byteOffset != null ? skinIndexBufferView.byteOffset : 0 +
          skinIndexAccessor.byteOffset != null ? skinIndexAccessor.byteOffset : 0;
        const indexArray = new Uint16Array(buffers[skinIndexBufferView.buffer], start, skinIndexAccessor.count * 4);
        let floatIndex = [];
        for (let i = 0; i < skinIndexAccessor.count * 4; i++)
          floatIndex.push(indexArray[i]);
        attributes["skinIndex"] = Float32Array.from(floatIndex).buffer;
      }

      // Skin weights
      const skinWeightAccessor: GLTF2Accessor = gltf.accessors[primitive.attributes["WEIGHTS_0"]];
      if (skinWeightAccessor != null) {
        if (skinWeightAccessor.componentType !== GLTF2Const.FLOAT) {
          callback([ createLogError(`Unsupported component type for skin weight accessor: ${skinWeightAccessor.componentType}`) ]);
          return;
        }

        const skinWeightBufferView: GLTF2BufferView = gltf.bufferViews[skinWeightAccessor.bufferView];
        const start =
          skinWeightBufferView.byteOffset != null ? skinWeightBufferView.byteOffset : 0 +
          skinWeightAccessor.byteOffset != null ? skinWeightAccessor.byteOffset : 0;
        attributes["skinWeight"] = buffers[skinWeightBufferView.buffer].slice(start, start + skinWeightAccessor.count * 4 * 4);
      }

      // Bones
      let bones: { name: string; matrix: number[]; parentIndex: number }[] = null;
      if (skin != null) {
        bones = [];
        for (let i = 0; i < skin.joints.length; i++) {
          const jointId = skin.joints[i];
          const boneNode = gltf.nodes[jointId];
          const bone = { name: boneNode.name, matrix: getNodeMatrixGLTF2(boneNode).toArray(), parentIndex: <number>null };
          bones.push(bone);
        }

        for (let i = 0; i < skin.joints.length; i++) {
          const jointId = skin.joints[i];
          if (gltf.nodes[jointId].children == null) continue;
          for (const childJointId of gltf.nodes[jointId].children) {
            const boneIndex = skin.joints.indexOf(childJointId);
            if (boneIndex !== -1) bones[boneIndex].parentIndex = i;
          }
        }
      }

      let interpolationErrors = 0;
      // Animation
      let animation: { duration: number; keyFrames: { [jointName: string]: any } } = null;
      if (gltf.animations != null && gltf.animations.length > 0) {
        if (gltf.animations.length > 1)
          logEntries.push(createLogWarning(`There is ${gltf.animations.length} animations in this file, only the first one will be imported`, gltfFile.name));

        animation = { duration: 0, keyFrames: {} };
        const gltfAnim = gltf.animations[0];

        for (const gltfChannelName in gltfAnim.channels) {
          const gltfChannel = gltfAnim.channels[gltfChannelName];
          const gltfSampler = gltfAnim.samplers[gltfChannel.sampler];

          const jointName = gltf.nodes[gltfChannel.target.node].name;
          // TODO: get skin.jointNames.indexOf(jointName) and work with IDs instead of jointName?

          let boneAnim = animation.keyFrames[jointName];
          if (boneAnim == null) boneAnim = animation.keyFrames[jointName] = {};

          if (boneAnim[gltfChannel.target.path] != null) {
            callback([ createLogError(`Found multiple animations for ${gltfChannel.target.path} of ${jointName} bone`) ]);
            return;
          }

          let boneTransformAnim = boneAnim[gltfChannel.target.path];
          if (boneTransformAnim == null) boneTransformAnim = boneAnim[gltfChannel.target.path] = [];

          const inputParameterId = gltfSampler.input;
          const timeAccessor: GLTF2Accessor = gltf.accessors[inputParameterId];
          if (timeAccessor.componentType !== GLTF2Const.FLOAT) {
            callback([ createLogError(`Unsupported component type for animation time accessor: ${timeAccessor.componentType}`) ]);
            return;
          }

          const timeBufferView: GLTF2BufferView = gltf.bufferViews[timeAccessor.bufferView];
          const startTime =
            timeBufferView.byteOffset != null ? timeBufferView.byteOffset : 0 +
            timeAccessor.byteOffset != null ? timeAccessor.byteOffset : 0;
          const timeArray = new Float32Array(buffers[timeBufferView.buffer], startTime, timeAccessor.count);

          const outputParameterId = gltfSampler.output;
          const outputAccessor: GLTF2Accessor = gltf.accessors[outputParameterId];
          if (outputAccessor.componentType !== GLTF2Const.FLOAT) {
            callback([ createLogError(`Unsupported component type for animation output accessor: ${outputAccessor.componentType}`) ]);
            return;
          }

          const componentsCount = (outputAccessor.type === "VEC3") ? 3 : 4;

          const outputBufferView: GLTF2BufferView = gltf.bufferViews[outputAccessor.bufferView];
          const startOutput =
            outputBufferView.byteOffset != null ? outputBufferView.byteOffset : 0 +
            outputAccessor.byteOffset != null ? outputAccessor.byteOffset : 0;
          const outputArray = new Float32Array(buffers[outputBufferView.buffer], startOutput, outputAccessor.count * componentsCount);

          if (gltfSampler.interpolation !== GLTF2Interpolation.LINEAR)
            interpolationErrors++;
          const multCubic = (gltfSampler.interpolation === GLTF2Interpolation.CUBICSPLINE) ? 3 : 1;
          const offCubic = (gltfSampler.interpolation === GLTF2Interpolation.CUBICSPLINE) ? componentsCount : 0;

          for (let i = 0; i < timeArray.length; i++) {
            const time = timeArray[i];

            const value: number[] = [];
            for (let j = 0; j < componentsCount; j++) value.push(outputArray[i * componentsCount * multCubic + j + offCubic]);
            boneTransformAnim.push({ time, value });
            animation.duration = Math.max(animation.duration, time);
          }
        }
      }
      if (interpolationErrors > 0)
        logEntries.push(createLogWarning(`${interpolationErrors} unsupported interpolations. Replaced by a LINEAR interpolation`, gltfFile.name));

      logEntries.push(createLogInfo(`Imported glTF model v${gltf.asset.version}, ${attributes["position"].byteLength / 4 / 3} vertices.`, gltfFile.name));

      // Maps
      const maps: { [name: string]: ArrayBuffer } = {};

      if (Object.keys(imageFiles).length === 0) {
        callback(logEntries, { attributes, bones, maps, animation, upAxisMatrix: (upAxisMatrix != null) ? upAxisMatrix.toArray() : null });
        return;
      }

      SupClient.readFile(imageFiles[Object.keys(imageFiles)[0]], "arraybuffer", (err, data) => {
        maps["map"] = data;
        callback(logEntries, { attributes, bones, maps, animation, upAxisMatrix: (upAxisMatrix != null) ? upAxisMatrix.toArray() : null });
      });
    });
  };

  const onGLTFRead = (gltf: GLTFFile) => {
    const meshNames = Object.keys(gltf.meshes);
    if (meshNames.length > 1) { callback([ createLogError("Only a single mesh is supported") ], gltfFile.name); return; }

    const buffers: { [name: string]: ArrayBuffer } = {};
    const rootNode = gltf.nodes[ gltf.scenes[gltf.scene].nodes[0] ];

    // Check if the model has its up-axis pointing in the wrong direction
    let upAxisMatrix: THREE.Matrix4 = null;

    if (rootNode.name === "Y_UP_Transform") {
      upAxisMatrix = new THREE.Matrix4().fromArray(rootNode.matrix);
      if (gltf.asset.generator === "collada2gltf@abb81d52ce290268fdb67b96f5bc5c620dee5bb5") {
        // The Y_UP_Transform matrix needed to be reversed
        // prior to this pull request: https://github.com/KhronosGroup/glTF/pull/332
        upAxisMatrix.invert();
      }
    }

    let meshName: string = null;
    // let rootBoneNames: string[] = null;
    let skin: any = null;

    const nodesByJointName: { [jointName: string]: GLTFNode } = {};

    const walkNode = (rootNode: GLTFNode) => {
      if (rootNode.jointName != null) nodesByJointName[rootNode.jointName] = rootNode;

      if (meshName == null) {
        // glTF < 1.0 used to have an instanceSkin property on nodes
        const instanceSkin: GLTFNode = (gltf.asset.version !== "0.8") ? rootNode : (<any>rootNode).instanceSkin;

        if (instanceSkin != null && instanceSkin.meshes != null && instanceSkin.meshes.length > 0) {
          meshName = instanceSkin.meshes[0];
          // rootBoneNames = instanceSkin.skeletons;
          skin = gltf.skins[instanceSkin.skin];
        }

        else if (rootNode.meshes != null && rootNode.meshes.length > 0) {
          meshName = rootNode.meshes[0];
        }
      }

      for (const childName of rootNode.children) {
        walkNode(gltf.nodes[childName]);
      }
    };

    for (const rootNodeName of gltf.scenes[gltf.scene].nodes) walkNode(gltf.nodes[rootNodeName]);

    if (meshName == null && meshNames.length > 0) {
      // For some reason, sometimes the mesh won't be attached to a node,
      // So let's just pick it up from gltf.meshes
      meshName = meshNames[0];

      // And look for a skin, too
      const skinNames = Object.keys(gltf.skins);
      if (skinNames.length === 1) skin = gltf.skins[skinNames[0]];
    }
    if (meshName == null) { callback([ createLogError("No mesh found", gltfFile.name) ]); return; }

    const meshInfo = gltf.meshes[meshName];
    if (meshInfo.primitives.length !== 1) { callback([ createLogError("Only a single primitive is supported", gltfFile.name) ]); return; }

    const mode = (gltf.asset.version !== "0.8") ? meshInfo.primitives[0].mode : (<any>meshInfo.primitives[0]).primitive;
    if (mode !== GLTFPrimitiveMode.TRIANGLES) { callback([ createLogError("Only triangles are supported", gltfFile.name) ]); return; }

    async.each(Object.keys(gltf.buffers), (name, cb) => {
      const bufferInfo = gltf.buffers[name];

      // Remove path info from the URI
      let filename = decodeURI(bufferInfo.uri);
      if (filename.indexOf("/") !== -1) filename = filename.substring(filename.lastIndexOf("/") + 1);
      else if (filename.indexOf("\\") !== -1) filename = filename.substring(filename.lastIndexOf("\\") + 1);

      const bufferFile = bufferFiles[filename];
      if (bufferFile == null) { cb(new Error(`Missing buffer file: ${filename} (${bufferInfo.uri})`)); return; }

      SupClient.readFile(bufferFile, "arraybuffer", (err: Error, buffer: ArrayBuffer) => {
        if (err != null) { cb(new Error(`Could not read buffer file: ${filename} (${bufferInfo.uri})`)); return; }
        buffers[name] = buffer;
        cb(null);
      });
    }, (err: Error) => {
      if (err != null) { callback([ createLogError(err.message) ]); return; }

      const primitive = meshInfo.primitives[0];
      const attributes: { [name: string]: ArrayBuffer } = {};

      // Indices
      const indexAccessor: GLTFAccessor = gltf.accessors[primitive.indices];
      if (indexAccessor != null) {
        if (indexAccessor.componentType !== GLTFConst.UNSIGNED_SHORT) {
          callback([ createLogError(`Unsupported component type for index accessor: ${indexAccessor.componentType}`) ]);
          return;
        }

        const indexBufferView: GLTFBufferView = gltf.bufferViews[indexAccessor.bufferView];
        const start = indexBufferView.byteOffset + indexAccessor.byteOffset;
        attributes["index"] = buffers[indexBufferView.buffer].slice(start, start + indexAccessor.count * 2);
      }

      // Position
      const positionAccessor: GLTFAccessor = gltf.accessors[primitive.attributes["POSITION"]];
      if (positionAccessor.componentType !== GLTFConst.FLOAT) {
        callback([ createLogError(`Unsupported component type for position accessor: ${positionAccessor.componentType}`) ]);
        return;
      }

      {
        const positionBufferView: GLTFBufferView = gltf.bufferViews[positionAccessor.bufferView];
        const start = positionBufferView.byteOffset + positionAccessor.byteOffset;

        if (skin != null) {
          const bindShapeMatrix = new THREE.Matrix4().fromArray(skin.bindShapeMatrix);
          const positionArray = new Float32Array(buffers[positionBufferView.buffer], start, positionAccessor.count * 3);
          for (let i = 0; i < positionAccessor.count; i++) {
            const pos = new THREE.Vector3(positionArray[i * 3 + 0], positionArray[i * 3 + 1], positionArray[i * 3 + 2]);
            pos.applyMatrix4(bindShapeMatrix);
            positionArray[i * 3 + 0] = pos.x;
            positionArray[i * 3 + 1] = pos.y;
            positionArray[i * 3 + 2] = pos.z;
          }
        }

        attributes["position"] = buffers[positionBufferView.buffer].slice(start, start + positionAccessor.count * positionAccessor.byteStride);
      }

      // Normal
      const normalAccessor: GLTFAccessor = gltf.accessors[primitive.attributes["NORMAL"]];
      if (normalAccessor != null) {
        if (normalAccessor.componentType !== GLTFConst.FLOAT) {
          callback([ createLogError(`Unsupported component type for normal accessor: ${normalAccessor.componentType}`) ]);
          return;
        }

        const normalBufferView: GLTFBufferView = gltf.bufferViews[normalAccessor.bufferView];
        const start = normalBufferView.byteOffset + normalAccessor.byteOffset;
        attributes["normal"] = buffers[normalBufferView.buffer].slice(start, start + normalAccessor.count * normalAccessor.byteStride);
      }

      // UV
      const uvAccessor: GLTFAccessor = gltf.accessors[primitive.attributes["TEXCOORD_0"]];
      if (uvAccessor != null) {
        if (uvAccessor.componentType !== GLTFConst.FLOAT) {
          callback([ createLogError(`Unsupported component type for UV accessor: ${uvAccessor.componentType}`) ]);
          return;
        }

        const uvBufferView: GLTFBufferView = gltf.bufferViews[uvAccessor.bufferView];
        const start = uvBufferView.byteOffset + uvAccessor.byteOffset;
        const uvArray = new Float32Array(buffers[uvBufferView.buffer], start, uvAccessor.count * 2);

        for (let i = 0; i < uvAccessor.count; i++) {
          uvArray[i * 2 + 1] = 1 - uvArray[i * 2 + 1];
        }

        attributes["uv"] = buffers[uvBufferView.buffer].slice(start, start + uvAccessor.count * uvAccessor.byteStride);
      }

      // TODO: support more attributes

      // Skin indices
      const skinIndexAccessor: GLTFAccessor = gltf.accessors[primitive.attributes["JOINT"]];
      if (skinIndexAccessor != null) {
        if (skinIndexAccessor.componentType !== GLTFConst.FLOAT) {
          callback([ createLogError(`Unsupported component type for skin index accessor: ${skinIndexAccessor.componentType}`) ]);
          return;
        }

        const skinIndexBufferView: GLTFBufferView = gltf.bufferViews[skinIndexAccessor.bufferView];
        const start = skinIndexBufferView.byteOffset + skinIndexAccessor.byteOffset;
        attributes["skinIndex"] = buffers[skinIndexBufferView.buffer].slice(start, start + skinIndexAccessor.count * skinIndexAccessor.byteStride);
      }

      // Skin weights
      const skinWeightAccessor: GLTFAccessor = gltf.accessors[primitive.attributes["WEIGHT"]];
      if (skinWeightAccessor != null) {
        if (skinWeightAccessor.componentType !== GLTFConst.FLOAT) {
          callback([ createLogError(`Unsupported component type for skin weight accessor: ${skinWeightAccessor.componentType}`) ]);
          return;
        }

        const skinWeightBufferView: GLTFBufferView = gltf.bufferViews[skinWeightAccessor.bufferView];
        const start = skinWeightBufferView.byteOffset + skinWeightAccessor.byteOffset;
        attributes["skinWeight"] = buffers[skinWeightBufferView.buffer].slice(start, start + skinWeightAccessor.count * skinWeightAccessor.byteStride);
      }

      // Bones
      let bones: { name: string; matrix: number[]; parentIndex: number }[] = null;
      if (skin != null) {
        bones = [];

        for (let i = 0; i < skin.jointNames.length; i++) {
          const jointName = skin.jointNames[i];
          const boneNode = nodesByJointName[jointName];
          const bone = { name: boneNode.jointName, matrix: getNodeMatrix(boneNode, gltf.asset.version).toArray(), parentIndex: <number>null };
          bones.push(bone);
        }

        for (let i = 0; i < skin.jointNames.length; i++) {
          const jointName = skin.jointNames[i];
          for (const childJointName of nodesByJointName[jointName].children) {
            const boneIndex = skin.jointNames.indexOf(childJointName);
            if (boneIndex !== -1) bones[boneIndex].parentIndex = i;
          }
        }
      }

      // Animation
      let animation: { duration: number; keyFrames: { [jointName: string]: any } } = null;
      if (Object.keys(gltf.animations).length > 0) {
        animation = { duration: 0, keyFrames: {} };

        for (const gltfAnimName in gltf.animations) {
          const gltfAnim = gltf.animations[gltfAnimName];
          // gltfAnim.count = keyframe count

          // gltfAnim.channels gives bone name + path (scale, rotation, position)
          for (const gltfChannelName in gltfAnim.channels) {
            const gltfChannel = gltfAnim.channels[gltfChannelName];

            const jointName = gltfChannel.target.id;
            // TODO: get skin.jointNames.indexOf(jointName) and work with IDs instead of jointName?

            let boneAnim = animation.keyFrames[jointName];
            if (boneAnim == null) boneAnim = animation.keyFrames[jointName] = {};

            if (boneAnim[gltfChannel.target.path] != null) {
              callback([ createLogError(`Found multiple animations for ${gltfChannel.target.path} of ${jointName} bone`) ]);
              return;
            }

            let boneTransformAnim = boneAnim[gltfChannel.target.path];
            if (boneTransformAnim == null) boneTransformAnim = boneAnim[gltfChannel.target.path] = [];

            const inputParameterName = gltfAnim.samplers[gltfChannel.sampler].input;
            const timeAccessor: GLTFAccessor = gltf.accessors[gltfAnim.parameters[inputParameterName]];
            if (timeAccessor.componentType !== GLTFConst.FLOAT) {
              callback([ createLogError(`Unsupported component type for animation time accessor: ${timeAccessor.componentType}`) ]);
              return;
            }

            const timeBufferView: GLTFBufferView = gltf.bufferViews[timeAccessor.bufferView];
            const timeArray = new Float32Array(buffers[timeBufferView.buffer], timeBufferView.byteOffset + timeAccessor.byteOffset, timeAccessor.count);

            const outputParameterName = gltfAnim.samplers[gltfChannel.sampler].output;
            const outputAccessor: GLTFAccessor = gltf.accessors[gltfAnim.parameters[outputParameterName]];
            if (outputAccessor.componentType !== GLTFConst.FLOAT) {
              callback([ createLogError(`Unsupported component type for animation output accessor: ${outputAccessor.componentType}`) ]);
              return;
            }

            const componentsCount = (outputAccessor.type === "VEC3") ? 3 : 4;

            const outputBufferView: GLTFBufferView = gltf.bufferViews[outputAccessor.bufferView];
            const outputArray = new Float32Array(buffers[outputBufferView.buffer], outputBufferView.byteOffset + outputAccessor.byteOffset, outputAccessor.count * componentsCount);

            if (outputParameterName === "rotation" && gltf.asset.version === "0.8") convertAxisAngleToQuaternionArray(outputArray, outputAccessor.count);

            for (let i = 0; i < timeArray.length; i++) {
              const time = timeArray[i];

              const value: number[] = [];
              for (let j = 0; j < componentsCount; j++) value.push(outputArray[i * componentsCount + j]);
              boneTransformAnim.push({ time, value });
              animation.duration = Math.max(animation.duration, time);
            }
          }
        }
      }
      console.log(attributes);
      console.log(bones);
      console.log(animation);

      const log = [ createLogInfo(`Imported glTF model v${gltf.asset.version}, ${attributes["position"].byteLength / 4 / 3} vertices.`, gltfFile.name) ];

      // Maps
      const maps: { [name: string]: ArrayBuffer } = {};

      if (Object.keys(imageFiles).length === 0) {
        callback(log, { attributes, bones, maps, animation, upAxisMatrix: (upAxisMatrix != null) ? upAxisMatrix.toArray() : null });
        return;
      }

      SupClient.readFile(imageFiles[Object.keys(imageFiles)[0]], "arraybuffer", (err, data) => {
        maps["map"] = data;
        callback(log, { attributes, bones, maps, animation, upAxisMatrix: (upAxisMatrix != null) ? upAxisMatrix.toArray() : null });
      });
    });
  };

  SupClient.readFile(gltfFile, "json", onFileRead);
}
