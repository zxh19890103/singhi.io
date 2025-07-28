import { type Placement, getPlacement } from "../utils/index.js";
import * as core from "../core/index.js";

export class Text extends core.Text {
  constructor(text: string, placement: Placement = null) {
    super({}, "Text");
    this.$el.innerText = text;
  }
}
