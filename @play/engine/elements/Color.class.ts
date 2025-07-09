import * as THREE from "three"

export class Color extends THREE.Mesh {
  constructor(color: number, alpha: number = 1) {
    const geometry = new THREE.PlaneGeometry(0.1, 0.1)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: alpha,
      side: THREE.DoubleSide,
    })
    super(geometry, material)

    this.geometry.computeBoundingSphere()
    this.geometry.computeBoundingBox()
  }
}
