import * as THREE from "three";
import * as core from "../core/index.js";

type Options = { size: number; alpha: number };

export class Color extends core.Mesh<Options> {
  constructor(color: THREE.ColorRepresentation, options: core.InputOptions<Options>) {
    const geometry = new THREE.PlaneGeometry(options.size, options.size);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: options.alpha,
      side: THREE.DoubleSide,
    });

    super({
      geometry,
      material,
      color,
      ...options,
    });
  }
}
