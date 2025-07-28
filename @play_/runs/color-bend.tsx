import * as THREE from "three";
import { PlayEngine, elements } from "@play/engine";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./color-blend-form.js";

class Play extends PlayEngine {
  readonly controllerEnabled = true;

  play(): void {
    this.thread();

    const sensor = this.appear(elements.Circle, [100, 300], 0, 0xfe9100, {
      radius: 30,
      label: "感測器",
    });
    this.popup(sensor, 2);

    const edgeDevice = this.appear(elements.Box, [300, 300], 0, 0xfe0190, {
      size: [80, 40, 30],
      label: "邊緣裝置",
    });

    // this.move(edgeDevice, "to", [300, 300], 2);
    const controlCenter = this.appear(elements.Box, [500, 300], 0, 0xfe0010, {
      size: [100, 50],
      label: "控制中心",
    });
    // this.place(controlCenter, "above", edgeDevice);
    const status = this.appear(elements.Label, [500, 230], 0, "狀態顯示");
    // this.fadein(status, 1);
    this.arrow(sensor, edgeDevice);
    this.arrow(edgeDevice, controlCenter);
    // this.appear(elements.Line, controlCenter, status);
  }

  protected override onInit(): void {
    createRoot(this.interactFormContainer, {}).render(
      createElement(App, {
        engine: this,
      }),
    );
  }
}

new Play(document.querySelector("#Content"));
