import * as THREE from "three";
import * as core from "../core/index.js";

type Options = { size: core.Size };

export class Box extends core.Mesh<Options> {
  constructor(
    color: THREE.ColorRepresentation,
    options: core.InputOptions<Options>,
  ) {
    const geometry = new THREE.BoxGeometry(
      options.size[0],
      options.size[1],
      options.size[2] ?? 1,
      64,
    );

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: options.alpha ?? 0.56,
      side: THREE.DoubleSide,
    });

    super({
      geometry,
      material,
      color,
      ...options,
    });

    const edges = new THREE.EdgesGeometry(geometry);
    this.add(
      new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x000000 }),
      ),
    );
  }
}
