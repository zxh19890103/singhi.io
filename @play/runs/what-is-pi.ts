import * as THREE from "three"
import {
  ExplainationPlayEngine,
  elements,
  Placement,
  utils,
} from "@play/engine"
import { createElement } from "react"
import { createRoot } from "react-dom/client"

import { Button } from "./components/Button.js"

class Play extends ExplainationPlayEngine {
  play(): void {
    const formula = new elements.Formula(
      `\\pi = 3.141592678`,
      Placement.LEFT_TOP,
    )

    const line = new elements.Line(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.4, 0, 0.0),
    )

    const circle = new elements.CircleOutlined(0.4)

    const text = new elements.Text("hello", Placement.TOP)

    const table = new elements.Table()
    table.position.copy(utils.getPlacement(Placement.LEFT))

    const lineChart = new elements.LineChart(null, Placement.RIGHT_BOTTOM)

    const dist = new elements.Distance(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    )

    const dist2 = new elements.Distance(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    )

    table.setTh(["n", "r", "D", "S", "pi = S/D"])

    this.world.add(circle, formula, text, dist, dist2, table, lineChart)

    const play = () => {
      dist2.$for(circle, circle.getEdgePt(0, 1.01), circle.getEdgePt(180, 1.01))

      const D = dist2.getDistance()
      let totalDist = 0

      utils.counter(
        circle.segments,
        (i) => {
          dist.$for(
            circle,
            circle.getEdgePtAt(i, 1.01),
            circle.getEdgePtAt(i + 1, 1.01),
          )
          const d = dist.getDistance()
          totalDist += d
          formula.setLatex(
            `
            R = ${circle.radius} \\newline
            N = ${circle.segments} \\newline
            D = ${D.toFixed(5)} \\newline
          S = ${totalDist.toFixed(5)} \\newline 
          {S}/{D}=${(totalDist / D).toFixed(5)} \\newline
          `,
          )
          return 10
        },
        null,
        () => {
          table.addTd([
            circle.segments + "",
            circle.radius + "",
            D.toFixed(5),
            totalDist.toFixed(5),
            (totalDist / D).toFixed(10),
          ])

          lineChart.addData(circle.segments, totalDist / D)

          circle.setSegments(circle.segments + 100)
          play()
        },
      )
    }

    play()

    // const rotation = gsap.to(formula.position, {
    //   x: -0.3,
    //   duration: 6,
    //   ease: "power1.inOut",
    // })

    // this.tl.add(rotation, 0)
  }
}

new Play(document.querySelector("#Content"))

createRoot(document.querySelector("#ReactApp"), {}).render(
  createElement(Button),
)
