import * as THREE from "three";

import { ExplainationPlayEngine, elements } from "@play/engine";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "./components/Button.js";

class Play extends ExplainationPlayEngine {
  async play() {
    this.appear(elements.Title, "If `transparent = false`?");
    this.wait(1);
    this.disappear();
    this.appear(elements.Title, "Blending does not matter!");
    this.alive(3);
    this.appear(elements.Color, 0xfe1001, 1);
    this.appear(elements.Circle, 0.05, 0xfe1090);
    this.activity((tl: gsap.core.Timeline, cirlce: elements.Circle) => {
      tl.to(cirlce.position, { x: -0.5, duration: 6 });
    });
    this.alive(2);

    // const colorGreen = new elements.Color(0x10ef30, 0.6)
    // new elements.Label("#10ef30 0.6").$for(colorGreen)
    // colorGreen.position.set(0.05, 0, 0)

    // const colorCoral = new elements.Color(0xfe4130, 0.1)
    // new elements.Label("#fe4130 0.1").$for(colorCoral)
    // colorCoral.position.set(-0.05, 0, 0)

    // this.tl.to(
    //   colorGreen.position,
    //   {
    //     x: 0,
    //     duration: 1,
    //   },
    //   0,
    // )

    // this.tl.to(
    //   colorCoral.position,
    //   {
    //     x: 0,
    //     duration: 1,
    //   },
    //   0,
    // )

    // this.world.add(colorCoral, colorGreen)
    // this.tl.play()
  }
}

new Play(document.querySelector("#Content"));

createRoot(document.querySelector("#ReactApp"), {}).render(
  createElement(Button),
);
