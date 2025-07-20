/**
 * Designed for display label for an element
 */
import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { type Placement, getPlacement } from "../utils/index.js"

export class Label extends CSS2DObject {
  constructor(text: string, placement: Placement = null) {
    const box = document.createElement("div")
    box.className = "Label"
    box.innerText = text
    super(box)
    this.position.copy(getPlacement(placement))
  }

  $for(obj3: THREE.Object3D, placement: Placement = null) {
    obj3.add(this)
  }
}
