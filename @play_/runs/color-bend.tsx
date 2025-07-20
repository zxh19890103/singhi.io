import * as THREE from "three";
import { PlayEngine, elements } from "@play/engine";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./color-blend-form.js";

class Play extends PlayEngine {
  readonly controllerEnabled = true;

  /**
   * multiple threads.
   */
  async play1() {
    this.thread();

    this.appear(elements.Title, "So, transparent = true");
    this.wait(4);
    this.disappear();
    this.appear(elements.Color, 0xfe1001, 0.2, 0.7);
    this.appear(elements.Color, 0x12ef91, 0.1, 0.4);

    this.activity((tl, color1, color2) => {
      tl.to(color1.position, { x: -0.3, duration: 6 }, 0);
      tl.to(color2.position, { x: 0.3, duration: 6 }, 0);
    });

    this.wait(2);
    this.appear(elements.Title, "now interact!");

    this.activity((tl, title) => {
      tl.to(title.position, {
        y: -0.2,
        duration: 4,
      });
    });

    this.interact((form, tl, title, color2: elements.Color, color1) => {
      form.spy("key1", (size: number) => {
        console.log("key1's value = ", size);
        color2.scale.multiplyScalar(2);
      });
    });

    this.alive(4);
    this.appear(elements.Title, "fine!");
  }

  play(): void {
    this.thread();
    this.appear(elements.Title, "Hi");
    this.interactWith(() => <div>Hello</div>, (form, tl, title) => {
    });
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
