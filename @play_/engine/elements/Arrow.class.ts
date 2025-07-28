import * as THREE from "three";
import * as core from "../core/index.js";

type Options = {};

export class Arrow extends core.Line<Options> {
  constructor(from: THREE.Vector3, to: THREE.Vector3) {
    // Define the vertices for the line
    const points: THREE.Vector3[] = [];
    points.push(from);
    points.push(to);
    // Create a BufferGeometry and set the vertices
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // Create a basic black line material
    const material = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color

    super({
      geometry,
      material,
    });
  }
}
