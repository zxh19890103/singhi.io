import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { getPlacement, type Placement } from "../utils/index.js"

export class Formula extends CSS2DObject {
  constructor(latex: string, placement: Placement = null) {
    const formula = katex.renderToString(latex, { throwOnError: false })

    const box = document.createElement("div")
    box.className = "Formula"
    box.innerHTML = formula
    super(box)

    this.position.copy(getPlacement(placement))
  }

  setLatex(latex: string) {
    const formula = katex.renderToString(latex, { throwOnError: false })
    this.element.innerHTML = formula
  }

  addLatex() {}

  $for(obj3: THREE.Object3D) {
    obj3.add(this)
  }
}
