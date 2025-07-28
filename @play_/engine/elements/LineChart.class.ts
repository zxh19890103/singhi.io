import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { getPlacement, type Placement } from "../utils/index.js";
import type { Chart as ChartType } from "chart.js";
import * as core from "../core/index.js";

export class LineChart extends core.Text {
  readonly chart: ChartType;

  constructor(data: any, placement: Placement = null) {
    super({}, "Chart");

    const canvas = document.createElement("canvas");
    this.$el.appendChild(canvas);

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
    });

    this.position.copy(getPlacement(placement));
  }

  setData(data: string) {}
  addData(factor: number, result: number) {
    this.chart.data.datasets[0].data.push({
      x: factor,
      y: result,
    });
    this.chart.update();
  }
}
