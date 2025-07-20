import { PlayEngine, Placement, elements } from "@play/engine"
import { createElement } from "react"
import { createRoot } from "react-dom/client"

import { Button } from "./components/Button.js"

class Play extends PlayEngine {
  play(): void {
    // const chart = new ele/ments.Chart(null, Placement.CENTER)
    // this.world.add(chart)
  }
}

new Play(document.querySelector("#Content"))

createRoot(document.querySelector("#ReactApp"), {}).render(
  createElement(Button),
)
