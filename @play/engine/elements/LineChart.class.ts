import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { getPlacement, type Placement } from "../utils/index.js"
import type { Chart as ChartType } from "chart.js"

export class LineChart extends CSS2DObject {
  readonly chart: ChartType

  constructor(data: any, placement: Placement = null) {
    const box = document.createElement("div")
    const canvas = document.createElement("canvas")
    box.appendChild(canvas)
    box.className = "Chart"

    super(box)

    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Pi",
            data: [],
            tension: 0.3,
          },
        ],
        // labels: [],
      },
      options: {
        scales: {
          x: {
            type: "linear",
          },
        },
      },
    })

    this.position.copy(getPlacement(placement))
  }

  setData(data: string) {}
  addData(factor: number, result: number) {
    this.chart.data.datasets[0].data.push({
      x: factor,
      y: result,
    })
    this.chart.update()
  }

  $for(obj3: THREE.Object3D) {
    obj3.add(this)
  }
}
