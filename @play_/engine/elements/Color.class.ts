import * as THREE from "three";

export class Color extends THREE.Mesh {
  constructor(color: number, size: number = 0.1, alpha: number = 0) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: alpha,
      side: THREE.DoubleSide,
    });
    super(geometry, material);

    this.geometry.computeBoundingSphere();
    this.geometry.computeBoundingBox();
  }
}
