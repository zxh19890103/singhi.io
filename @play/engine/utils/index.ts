// utils/placement-utils.ts (or wherever you prefer to keep helper functions)
import * as THREE from "three"

export * from "./domUtil.js"

/**
 * Defines standard placement positions.
 * - `CENTER`: Center of the screen/area.
 * - `LEFT`, `RIGHT`, `TOP`, `BOTTOM`: Midpoint of that edge.
 * - `LEFT_TOP`, `LEFT_BOTTOM`, `RIGHT_TOP`, `RIGHT_BOTTOM`: Corners.
 */
export enum Placement {
  CENTER = "center",
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
  LEFT_TOP = "left-top",
  LEFT_BOTTOM = "left-bottom",
  RIGHT_TOP = "right-top",
  RIGHT_BOTTOM = "right-bottom",
}

/**
 * Calculates a THREE.Vector3 position based on a given placement enum.
 * This function assumes a coordinate system where (0,0) is the center,
 * and extends outwards.
 *
 * @param pla The desired placement (e.g., Placement.LEFT_TOP).
 * @param areaWidth The total width of the area where placement is considered. Defaults to 2 (e.g., -1 to 1).
 * @param areaHeight The total height of the area where placement is considered. Defaults to 2 (e.g., -1 to 1).
 * @param zDepth The Z-coordinate for the placement. Defaults to 0 (on the XY plane).
 * @returns A THREE.Vector3 representing the calculated position.
 */
export function getPlacement(
  pla: Placement,
  areaWidth: number = 1,
  areaHeight: number = 1,
  zDepth: number = 0,
): THREE.Vector3 {
  let x = 0
  let y = 0
  const halfWidth = areaWidth / 2
  const halfHeight = areaHeight / 2

  switch (pla) {
    case Placement.CENTER:
      x = 0
      y = 0
      break
    case Placement.LEFT:
      x = -halfWidth
      y = 0
      break
    case Placement.RIGHT:
      x = halfWidth
      y = 0
      break
    case Placement.TOP:
      x = 0
      y = halfHeight
      break
    case Placement.BOTTOM:
      x = 0
      y = -halfHeight
      break
    case Placement.LEFT_TOP:
      x = -halfWidth
      y = halfHeight
      break
    case Placement.LEFT_BOTTOM:
      x = -halfWidth
      y = -halfHeight
      break
    case Placement.RIGHT_TOP:
      x = halfWidth
      y = halfHeight
      break
    case Placement.RIGHT_BOTTOM:
      x = halfWidth
      y = -halfHeight
      break
    default:
      console.warn(`Unknown placement type: ${pla}. Returning center position.`)
      x = 0
      y = 0
      break
  }

  return new THREE.Vector3(x, y, zDepth)
}

/**
 * Calculates the coordinates of a point on the edge of a circle.
 * The circle is assumed to be centered at (0,0,0) in its local space,
 * lying on the XY plane.
 *
 * @param radius The radius of the circle.
 * @param angleRadians The angle in radians, measured from the positive X-axis (counter-clockwise).
 * (e.g., 0 radians is positive X, Math.PI/2 is positive Y).
 * @returns A THREE.Vector3 representing the point on the circle's edge.
 */
export function getCircleEdgePoint(
  radius: number,
  angleRadians: number,
): THREE.Vector3 {
  const x = radius * Math.cos(angleRadians)
  const y = radius * Math.sin(angleRadians)
  const z = 0 // Assuming the circle is flat on the XY plane

  return new THREE.Vector3(x, y, z)
}

/**
 * Helper function to convert degrees to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Helper function to convert radians to degrees.
 * @param radians The angle in radians.
 * @returns The angle in degrees.
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

export function counter(
  n: number,
  iter: (i: number) => number,
  begin?: () => number,
  end?: () => void,
) {
  let i = 0

  const loop = () => {
    if (i === n) {
      end?.()
      return
    }
    const t = iter(i)
    setTimeout(loop, t)
    i++
  }

  if (begin) {
    const delay = begin()
    setTimeout(loop, delay)
  } else {
    loop()
  }
}
