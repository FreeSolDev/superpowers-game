import { EventEmitter } from "events";

const storageKey = "superpowers.game.sceneEditor";

const item = window.localStorage.getItem(storageKey);
export let pub: {
  formatVersion: number;
  showGridByDefault: boolean;
  defaultGridSize: number;
  controlSchemes: string;
  [key: string]: any;
} = item != null ? JSON.parse(item) : {
  formatVersion: 1,
  showGridByDefault: false,
  defaultGridSize: 1,

  // A little ugly, need to be global across all plugins not just in scene
  // TODO: move elsewhere or definitively change controls to be more consistent with other softwares
  controlSchemes: "superpowers"
};

export const emitter = new EventEmitter();

window.addEventListener("storage", (event) => {
  if (event.key !== storageKey) return;

  const oldPub = pub;
  pub = JSON.parse(event.newValue);

  if (oldPub.showGridByDefault !== pub.showGridByDefault) emitter.emit("showGridByDefault");
  if (oldPub.defaultGridSize !== pub.defaultGridSize) emitter.emit("defaultGridSize");
  if (oldPub.controlSchemes !== pub.controlSchemes) emitter.emit("controlSchemes");
});

export function edit(key: string, value: any) {
  pub[key] = value;
  window.localStorage.setItem(storageKey, JSON.stringify(pub));
}
