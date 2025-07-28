import * as THREE from "three";
import * as core from "../core/index.js";

type Options = { radius: number };

export class Circle extends core.Mesh<Options> {
  constructor(
    color: THREE.ColorRepresentation,
    options: core.InputOptions<Options>,
  ) {
    const geometry = new THREE.CircleGeometry(options.radius, 64);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      side: THREE.DoubleSide,
    });

    super({
      geometry,
      material,
      color,
      ...options,
    });

    console.log(this.options);
  }
}
