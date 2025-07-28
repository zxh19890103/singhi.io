/**
 * Designed for display label for an element
 */
import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { type Placement, getPlacement } from "../utils/index.js";
import * as core from "../core/index.js";

export class Label extends core.Text {
  constructor(text: string) {
    super({}, "Label");
    this.$el.innerText = text;
  }
}
