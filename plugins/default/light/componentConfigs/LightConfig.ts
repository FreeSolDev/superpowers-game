export interface LightConfigPub {
  formatVersion: number;

  type: string;
  color: string;
  intensity: number;
  distance: number;
  angle: number;
  penumbra: number;
  decay: number;
  target: { x: number; y: number; z: number; };
  castShadow: boolean;
  shadowMapSize: { width: number; height: number; };
  shadowBias: number;
  shadowCameraNearPlane: number; shadowCameraFarPlane: number;
  shadowCameraFocus: number;
  shadowCameraSize: { top: number; bottom: number; left: number; right: number; };
}

export default class LightConfig extends SupCore.Data.Base.ComponentConfig {

  static schema: SupCore.Data.Schema = {
    formatVersion: { type: "integer" },

    type: { type: "enum", items: ["ambient", "point", "spot", "directional"], mutable: true },
    color: { type: "string", length: 6, mutable: true },
    intensity: { type: "number", min: 0, mutable: true },
    distance: { type: "number", min: 0, mutable: true },
    angle: { type: "number", min: 0, max: 180, mutable: true },
    penumbra: { type: "number", min: 0, max: 1, mutable: true },
    decay: { type: "number", min: 0, mutable: true },
    target: {
      type: "hash",
      properties: {
        x: { type: "number", mutable: true },
        y: { type: "number", mutable: true },
        z: { type: "number", mutable: true }
      }
    },
    castShadow: { type: "boolean", mutable: true},
    shadowMapSize: {
      type: "hash",
      properties: {
        width: { type: "number", min: 1, mutable: true },
        height: { type: "number", min: 1, mutable: true },
      }
    },
    shadowBias: { type: "number", mutable: true },
    shadowDarkness: { type: "number", min: 0, max: 1, mutable: true }, // deprecated in v2
    shadowCameraNearPlane: { type: "number", min: 0, mutable: true },
    shadowCameraFarPlane: { type: "number", min: 0, mutable: true },
    shadowCameraFov: { type: "number", min: 0, mutable: true }, // deprecated, replaced by focus in v4
    shadowCameraFocus: { type: "number", min: 0, max: 1, mutable: true },
    shadowCameraSize: {
      type: "hash",
      properties: {
        top: { type: "number", mutable: true },
        bottom: { type: "number", mutable: true },
        left: { type: "number", mutable: true },
        right: { type: "number", mutable: true },
      }
    }
  };

  static create() {
    const emptyConfig: LightConfigPub = {
      formatVersion: LightConfig.currentFormatVersion,

      type: "ambient",
      color: "ffffff",
      intensity: 1,
      distance: 0,
      angle: 60,
      penumbra: 0.1,
      decay: 1,
      target: { x: 0, y: 0, z: 0},
      castShadow: false,
      shadowMapSize: { width: 512, height: 512 },
      shadowBias: 0,
      shadowCameraNearPlane: 0.1, shadowCameraFarPlane: 1000,
      shadowCameraFocus: 1,
      shadowCameraSize: { top: 100, bottom: -100, left: -100, right: 100 }
    };
    return emptyConfig;
  }

  static currentFormatVersion = 4;
  static migrate(pub: LightConfigPub) {
    if (pub.formatVersion === LightConfig.currentFormatVersion) return false;

    if (pub.formatVersion == null) {
      pub.formatVersion = 2;

      if (pub.shadowMapSize == null) {
        pub.shadowMapSize = { width: 512, height: 512 };
        pub.shadowBias = 0;
        pub.shadowCameraNearPlane = 0.1;
        pub.shadowCameraFarPlane = 1000;
        pub.shadowCameraSize = { top: 100, bottom: -100, left: -100, right: 100 };
      }
    }

    if (pub.formatVersion === 1) {
      pub.formatVersion = 2;

      delete (pub as any).shadowDarkness;
    }

    if (pub.formatVersion === 2) {
      pub.formatVersion = 3;

      if (pub.penumbra == null) pub.penumbra = 0.1;
      if (pub.decay == null) pub.decay = 1;
    }

    if (pub.formatVersion === 3) {
      pub.formatVersion = 4;

      pub.angle = pub.angle / 2;
      pub.shadowCameraFocus = (pub as any).shadowCameraFov / pub.angle;
      pub.shadowCameraFocus = Math.max(0, pub.shadowCameraFocus);
      pub.shadowCameraFocus = Math.min(pub.shadowCameraFocus, 1);
      delete (pub as any).shadowCameraFov;
    }

    return true;
  }

  constructor(pub: LightConfigPub) { super(pub, LightConfig.schema); }
}
