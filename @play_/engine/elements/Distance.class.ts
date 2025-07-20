// Distance.class.ts (Simplified API)
import * as THREE from "three"

/**
 * Represents the visual and calculated distance between two 3D points in a Three.js scene.
 * Visual settings like line style and marker appearance are set ONLY in the constructor.
 */
export class Distance extends THREE.Group {
  private startPoint: THREE.Vector3
  private endPoint: THREE.Vector3
  private distanceValue: number

  private line: THREE.Line
  private startMarker: THREE.Line
  private endMarker: THREE.Line
  // private distanceText: THREE.Mesh | undefined; // Placeholder for a 3D text object

  // Memorized properties (set in constructor, used by other methods)
  private _isDashed: boolean
  private _currentDashSize: number
  private _currentGapSize: number
  private _markerLength: number
  private _lineColor: THREE.ColorRepresentation
  private _markerColor: THREE.ColorRepresentation // Also storing marker color

  // Internal references for $for method to keep track of the attached object and local points
  private attachedObject: THREE.Object3D | null = null
  private attachedLocalPointA: THREE.Vector3 | null = null
  private attachedLocalPointB: THREE.Vector3 | null = null

  /**
   * Creates a new Distance visualizer and calculator.
   * All visual settings are configured here and cannot be changed via updatePoints or $for.
   *
   * @param p1 The initial first point (THREE.Vector3).
   * @param p2 The initial second point (THREE.Vector3).
   * @param lineColor The color of the main line connecting the points (default is black: 0x000000).
   * @param markerColor The color of the perpendicular markers at the endpoints (default is blue: 0x0000ff).
   * @param markerLength The total length of the perpendicular markers (default is 0.2).
   * @param dashed If true, the main distance line will be dashed (default is false).
   * @param dashSize The length of a dash segment if dashed (default is 0.1).
   * @param gapSize The length of the gap between dashes if dashed (default is 0.05).
   */
  constructor(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    lineColor: THREE.ColorRepresentation = 0xfe9101,
    markerColor: THREE.ColorRepresentation = 0x000000,
    markerLength: number = 0.02,
    dashed: boolean = true,
    dashSize: number = 0.01,
    gapSize: number = 0.005,
  ) {
    super()

    this.startPoint = p1.clone()
    this.endPoint = p2.clone()

    // Store all configuration parameters as private properties
    this._isDashed = dashed
    this._currentDashSize = dashSize
    this._currentGapSize = gapSize
    this._markerLength = markerLength
    this._lineColor = lineColor
    this._markerColor = markerColor

    // 1. Calculate the initial distance
    this.distanceValue = this.startPoint.distanceTo(this.endPoint)
    console.log(`Calculated initial distance: ${this.distanceValue.toFixed(3)}`)

    // 2. Visual: Main Line between points
    const mainLinePoints: THREE.Vector3[] = []
    mainLinePoints.push(this.startPoint)
    mainLinePoints.push(this.endPoint)

    const mainLineGeometry = new THREE.BufferGeometry().setFromPoints(
      mainLinePoints,
    )

    let mainLineMaterial: THREE.Material
    if (this._isDashed) {
      mainLineMaterial = new THREE.LineDashedMaterial({
        color: this._lineColor,
        linewidth: 1,
        scale: 1,
        dashSize: this._currentDashSize,
        gapSize: this._currentGapSize,
      })
    } else {
      mainLineMaterial = new THREE.LineBasicMaterial({
        color: this._lineColor,
        linewidth: 1,
      })
    }

    this.line = new THREE.Line(mainLineGeometry, mainLineMaterial)

    if (this._isDashed) {
      this.line.computeLineDistances()
    }

    this.add(this.line)

    // 3. Visual: Perpendicular Markers at endpoints
    const markerMaterial = new THREE.LineBasicMaterial({
      color: this._markerColor,
    }) // Use stored marker color

    this.startMarker = new THREE.Line(
      new THREE.BufferGeometry(),
      markerMaterial,
    )
    this.endMarker = new THREE.Line(new THREE.BufferGeometry(), markerMaterial)

    this.add(this.startMarker)
    this.add(this.endMarker)

    // Initial marker setup using stored _markerLength
    this.updateMarkerPositions(this._markerLength)

    // 4. Visual: Display the distance value (optional)
    /* ... */
  }

  /**
   * Gets the calculated distance value.
   * @returns The Euclidean distance between the two points.
   */
  public getDistance(): number {
    return this.distanceValue
  }

  /**
   * Updates the points and re-draws the distance visualization.
   * This method only changes the points being measured, not the visual style.
   *
   * @param p1 The new first point.
   * @param p2 The new second point.
   */
  public updatePoints(p1: THREE.Vector3, p2: THREE.Vector3): void {
    // Clear any previous attachment (since these points are explicitly provided)
    this.attachedObject = null
    this.attachedLocalPointA = null
    this.attachedLocalPointB = null

    this.startPoint.copy(p1)
    this.endPoint.copy(p2)

    // Update main line geometry
    const positions = (this.line.geometry as THREE.BufferGeometry).attributes
      .position
    if (positions) {
      ;(positions.array as Float32Array)[0] = this.startPoint.x
      ;(positions.array as Float32Array)[1] = this.startPoint.y
      ;(positions.array as Float32Array)[2] = this.startPoint.z
      ;(positions.array as Float32Array)[3] = this.endPoint.x
      ;(positions.array as Float32Array)[4] = this.endPoint.y
      ;(positions.array as Float32Array)[5] = this.endPoint.z
      positions.needsUpdate = true
    }

    // --- Material update: Only update color if the material instance itself changed (unlikely here)
    // or if the color was meant to be dynamic. Since color is now constructor-only,
    // we'll assume material never changes type here.
    // If you wanted to allow changing color without rebuilding material, you'd do:
    // (this.line.material as THREE.LineBasicMaterial).color.set(this._lineColor);

    // Re-compute line distances if it's a dashed line (needed after point changes)
    if (this._isDashed) {
      this.line.computeLineDistances()
    }

    this.distanceValue = this.startPoint.distanceTo(this.endPoint)
    console.log(`Updated distance: ${this.distanceValue.toFixed(3)}`)

    // Update markers using the stored _markerLength
    this.updateMarkerPositions(this._markerLength)

    // Update text if you have it implemented
    /* ... */
  }

  /**
   * Attaches this Distance visualizer to an Object3D, measuring the distance
   * between two points defined in the object's local coordinate system.
   * This method only defines *what* is measured, not *how* it looks.
   *
   * @param obj The THREE.Object3D to attach to.
   * @param localPointA The first point in the object's local coordinate system.
   * @param localPointB The second point in the object's local coordinate system.
   */
  public $for(
    obj: THREE.Object3D,
    localPointA: THREE.Vector3,
    localPointB: THREE.Vector3,
  ): void {
    // Store references for continuous updates
    this.attachedObject = obj
    this.attachedLocalPointA = localPointA.clone()
    this.attachedLocalPointB = localPointB.clone()

    // Calculate world positions
    const worldPointA = new THREE.Vector3()
      .copy(localPointA)
      .applyMatrix4(obj.matrixWorld)
    const worldPointB = new THREE.Vector3()
      .copy(localPointB)
      .applyMatrix4(obj.matrixWorld)

    // Update the Distance line using the calculated world points.
    // No style parameters are passed here.
    this.updatePoints(worldPointA, worldPointB)
  }

  /**
   * Internal helper to update the geometry of the perpendicular markers.
   * @param markerLength The total length of the perpendicular markers.
   */
  private updateMarkerPositions(markerLength: number): void {
    const direction = new THREE.Vector3()
      .subVectors(this.endPoint, this.startPoint)
      .normalize()

    const UP = new THREE.Vector3(0, 0, 1)
    let perpendicularVector = new THREE.Vector3().crossVectors(direction, UP)

    if (perpendicularVector.lengthSq() < 0.0001) {
      const FALLBACK_UP = new THREE.Vector3(0, 1, 0)
      perpendicularVector = new THREE.Vector3().crossVectors(
        direction,
        FALLBACK_UP,
      )
    }

    perpendicularVector.normalize().multiplyScalar(markerLength / 2)

    // --- Start Marker ---
    const startMarkerPoints: THREE.Vector3[] = []
    startMarkerPoints.push(
      new THREE.Vector3().subVectors(this.startPoint, perpendicularVector),
    )
    startMarkerPoints.push(
      new THREE.Vector3().addVectors(this.startPoint, perpendicularVector),
    )

    if (this.startMarker.geometry) {
      this.startMarker.geometry.dispose()
    }
    this.startMarker.geometry = new THREE.BufferGeometry().setFromPoints(
      startMarkerPoints,
    )

    // --- End Marker ---
    const endMarkerPoints: THREE.Vector3[] = []
    endMarkerPoints.push(
      new THREE.Vector3().subVectors(this.endPoint, perpendicularVector),
    )
    endMarkerPoints.push(
      new THREE.Vector3().addVectors(this.endPoint, perpendicularVector),
    )

    if (this.endMarker.geometry) {
      this.endMarker.geometry.dispose()
    }
    this.endMarker.geometry = new THREE.BufferGeometry().setFromPoints(
      endMarkerPoints,
    )
  }

  /**
   * Call this in your animation loop (after obj.updateMatrixWorld()) to keep
   * the distance visualization updated if the attached object moves or rotates.
   * This method only updates the points based on the attached object, not the visual style.
   */
  public updateForAttachedObject(): void {
    if (
      this.attachedObject &&
      this.attachedLocalPointA &&
      this.attachedLocalPointB
    ) {
      this.attachedObject.updateMatrixWorld(true)

      const worldPointA = new THREE.Vector3()
        .copy(this.attachedLocalPointA)
        .applyMatrix4(this.attachedObject.matrixWorld)
      const worldPointB = new THREE.Vector3()
        .copy(this.attachedLocalPointB)
        .applyMatrix4(this.attachedObject.matrixWorld)

      // Calls updatePoints without any style parameters, using the constructor's settings.
      this.updatePoints(worldPointA, worldPointB)
    }
  }
}
