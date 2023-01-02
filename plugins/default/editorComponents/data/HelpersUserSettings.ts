import { EventEmitter } from "events";

const storageKey = "superpowers.game.helpers";

const item = window.localStorage.getItem(storageKey);
export let pub: {
  formatVersion: number;
  controlSchemes3D: string;
  [key: string]: any;
} = item != null ? JSON.parse(item) : {
  formatVersion: 1,

  controlSchemes3D: "superpowers"
};

export const emitter = new EventEmitter();

window.addEventListener("storage", (event) => {
  if (event.key !== storageKey) return;

  const oldPub = pub;
  pub = JSON.parse(event.newValue);

  if (oldPub.controlSchemes3D !== pub.controlSchemes3D) emitter.emit("controlSchemes3D");
});

export function edit(key: string, value: any) {
  pub[key] = value;
  window.localStorage.setItem(storageKey, JSON.stringify(pub));
}
