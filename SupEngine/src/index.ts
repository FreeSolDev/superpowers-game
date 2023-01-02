import * as THREE from "three";
THREE.Euler.DefaultOrder = "YXZ";

import GameInstance from "./GameInstance";

import ActorTree from "./ActorTree";
import Actor from "./Actor";
import ActorComponent from "./ActorComponent";

import Input from "./Input";
import Audio from "./Audio";
import SoundPlayer from "./SoundPlayer";

export {
  THREE,
  GameInstance, ActorTree, Actor, ActorComponent,
  Input, Audio, SoundPlayer
};

import Camera from "./Camera";

export const editorComponentClasses: { [name: string]: new(...args: any[]) => ActorComponent } = {};

export function registerEditorComponentClass(name: string, componentClass: new(...args: any[]) => ActorComponent) {
  if (editorComponentClasses[name] != null) {
    console.error(`SupEngine.registerEditorComponent: Tried to register two or more classes named "${name}"`);
    return;
  }

  editorComponentClasses[name] = componentClass;
}

export function createEditorComponent<T extends ActorComponent>(name: string, ...args: any[]): T {
  const argsThis = [null].concat(args);
  const ctorFunc = editorComponentClasses[name].bind.apply(editorComponentClasses[name], argsThis);
  return new ctorFunc();
}

export const componentClasses: { [name: string]: new(...args: any[]) => ActorComponent } = {
  /* Built-ins */ Camera
};

export function registerComponentClass(name: string, plugin: new(...args: any[]) => ActorComponent) {
  if (componentClasses[name] != null) {
    console.error(`SupEngine.registerComponentClass: Tried to register two or more classes named "${name}"`);
    return;
  }

  componentClasses[name] = plugin;
}

export const earlyUpdateFunctions: {[name: string]: (gameInstance: GameInstance) => void } = {};
export function registerEarlyUpdateFunction(name: string, callback: (gameInstance: GameInstance) => void) {
  if (earlyUpdateFunctions[name] != null) {
    console.error(`SupEngine.registerEarlyUpdateFunction: Tried to register two or more functions named "${name}"`);
    return;
  }

  earlyUpdateFunctions[name] = callback;
}
