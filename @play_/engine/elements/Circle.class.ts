import * as THREE from "three"
import { getCircleEdgePoint } from "../utils/index.js"

export class Circle extends THREE.Mesh {
  constructor(radius: number, color: number = 0x000000) {
    const geometry = new THREE.CircleGeometry(radius, 64)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      side: THREE.DoubleSide,
    })
    super(geometry, material)
    this.geometry.computeBoundingSphere()
    this.geometry.computeBoundingBox()
  }
}

export class CircleOutlined extends THREE.Line {
  public anglePer: number

  /**
   * Creates a new CircleOutlined instance.
   * @param radius The radius of the circle.
   * @param segments The number of segments used to draw the circle (higher value means smoother circle).
   * @param color The color of the circle outline (default is black: 0x000000).
   */
  constructor(
    public radius: number = 1,
    public segments: number = 32,
    color: THREE.ColorRepresentation = 0x000000,
  ) {
    // Create a BufferGeometry and set the vertices
    const geometry = new THREE.BufferGeometry()

    // Create a basic line material with the specified color
    const material = new THREE.LineBasicMaterial({ color: color })

    // Call the parent Line constructor
    super(geometry, material)
    this.calcGeo()
  }

  private calcGeo() {
    const { segments, radius } = this

    this.anglePer = (1 / segments) * 360

    const points: number[] = []

    // Generate points around the circle
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      points.push(x, y, 0) // Z-coordinate is 0 for a flat circle
    }

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    )
  }

  setSegments(segments: number) {
    this.segments = segments
    this.calcGeo()
  }

  setRadius(r: number) {
    this.radius = r
    this.calcGeo()
  }

  getEdgePt(degree: number, r = 1) {
    return getCircleEdgePoint(r * this.radius, degree * THREE.MathUtils.DEG2RAD)
  }

  getEdgePtAt(i: number, r = 1) {
    return getCircleEdgePoint(
      r * this.radius,
      this.anglePer * i * THREE.MathUtils.DEG2RAD,
    )
  }
}
