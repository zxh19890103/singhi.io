import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { type Placement, getPlacement } from "../utils/index.js"

export class Text extends CSS2DObject {
  constructor(text: string, placement: Placement = null) {
    const box = document.createElement("div")
    box.className = "Text"
    box.innerText = text
    super(box)
    this.position.copy(getPlacement(placement))
  }

  $for(obj3: THREE.Object3D) {
    obj3.add(this)
  }
}
