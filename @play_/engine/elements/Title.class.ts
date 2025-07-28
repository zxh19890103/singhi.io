import { type Placement, getPlacement } from "../utils/index.js";
import * as core from "../core/index.js";

export class Title extends core.Text {
  constructor(text: string, placement: Placement = null) {
    super({}, "Title");
    this.$el.innerText = text;
  }
}
