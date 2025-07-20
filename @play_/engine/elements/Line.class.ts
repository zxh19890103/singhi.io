// Line.class.ts
import * as THREE from "three"

export class Line extends THREE.Line {
  /**
   * Creates a new Line instance.
   * @param startPoint The starting point of the line (THREE.Vector3).
   * @param endPoint The ending point of the line (THREE.Vector3).
   */
  constructor(startPoint: THREE.Vector3, endPoint: THREE.Vector3) {
    // Define the vertices for the line
    const points: THREE.Vector3[] = []
    points.push(startPoint)
    points.push(endPoint)

    // Create a BufferGeometry and set the vertices
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    // Create a basic black line material
    const material = new THREE.LineBasicMaterial({ color: 0x000000 }) // Black color

    // Call the parent Line constructor
    super(geometry, material)
  }
}
