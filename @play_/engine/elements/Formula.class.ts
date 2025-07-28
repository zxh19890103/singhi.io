import * as THREE from "three"
import { getPlacement, type Placement } from "../utils/index.js"
import * as core from '../core/index.js'

export class Formula extends core.Text {
  constructor(latex: string, placement: Placement = null) {
    const formula = katex.renderToString(latex, { throwOnError: false })
    super({}, 'Formula')
    this.$el.innerHTML = formula;
  }

  setLatex(latex: string) {
    const formula = katex.renderToString(latex, { throwOnError: false })
    this.$el.innerHTML = formula
  }

  addLatex() {}
}
