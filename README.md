# Superpowers Game

Make 2D and 3D games in live collaboration with [Superpowers](http://superpowers-html5.com/) using [TypeScript](http://www.typescriptlang.org/). Powered by [Three.js](http://threejs.org/) under the hood!

![](http://i.imgur.com/l9mtEv0.gif)

## Changes in this fork

### New features :
 - Post-processing on camera
 - [Add BMFont compatibility](https://github.com/Togimaro/superpowers-game-bmfont-plugin)
 - Default value detection for Behavior with initializer evaluation
 - Beta GLTF v2 import
 - Blendmodes support on SpriteRenderer (include Alpha Blending, Multiply, Additive, Screen, Substract, Erase, Darken, Lighten)
 - Add an error log panel on shader editor, expose sprite opacity to shaders and add a new default shader with color, opacity, alpha-testing and alpha-premultiplication taken into account

### Breaking change :
 - Update Three.js to r111, many plugins need some minor adjustement & type disambiguation
 - Precompile-script branch merged (cf https://github.com/superpowers/superpowers-game/commits/precompile-scripts). Most plugins need to be updated
 - The shaders are no longer treated as always transparent. The alpha-testing need to be taken into account now (cf default shader)
 - Same thing with the alpha premultiplication

## Roadmap / Ideas :
 - Improve Sup.Text performance & add more rendering options
 - Improve Behavior Editor: add more types (ie Array, simple interface) & Component reference
 - Improve build size and compilation time, test this caching stuff : https://gist.github.com/Ikalou/b3d0637435bade661975a306a6a9a4e7
 - Add prefab override
 - Add skybox/background color picker in editor & at runtime
 - Add more 3d model importer: fbx, blend?
 - Add layer rendering on camera
 - Add pixel-perfect camera
 - 9 Sliced sprite
 - Animated tilemap
 - Test FMOD integration
 - Merge some other fork improvement:
  - Gradient text : https://github.com/italozaina/superpowers-game
  - Some new Sup.Sound feature : https://github.com/usdivad/superpowers-game/tree/soundAdditions
  - Multitouch fixes : https://github.com/AgileJoshua/superpowers-game/tree/TouchFixes
  - P2js debug : https://github.com/GaetanRole/superpowers-game/tree/p2js-debug

## Todo :
 - Example projects
 - Screenshots of the new features
 
## How to install

Superpowers Game is currently bundled with Superpowers so there is no need to install it manually.

See [Building Superpowers](http://docs.superpowers-html5.com/en/development/building-superpowers) for information on building from sources.
