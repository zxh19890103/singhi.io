import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";

import { gsap } from "gsap";

import { playAnimation, observeDivSizeChange } from "./utils/index.js";

export abstract class ExplainationPlayEngine {
  readonly introElement: HTMLDivElement;
  readonly outroElement: HTMLDivElement;

  readonly world: THREE.Scene;
  readonly tl: GSAPTimeline;

  constructor(readonly element: HTMLDivElement) {
    element.classList.add("PlayCanvas");

    this.introElement = element.querySelector(".Intro");
    this.outroElement = element.querySelector(".Outro");

    // --- Scene Setup ---
    // A scene is where you set up what you want to render.
    const scene = new THREE.Scene();

    const clientWidth = element.clientWidth;
    const clientHeight = element.clientHeight;

    // --- Camera Setup ---
    // A PerspectiveCamera is used to simulate how the human eye sees.
    // Parameters: Field of View (FOV), Aspect Ratio, Near Clipping Plane, Far Clipping Plane
    const camera = new THREE.PerspectiveCamera(
      75, // FOV: Vertical field of view in degrees
      clientWidth / clientHeight, // Aspect Ratio: Width divided by height
      0.1, // Near: Objects closer than this won't be rendered
      1000, // Far: Objects farther than this won't be rendered
    );

    // Position the camera back so we can see the cube
    camera.position.z = 0.8;

    // --- Renderer Setup ---
    // The WebGLRenderer renders your scene using WebGL.
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias for smoother edges
    const css2drenderer = new CSS2DRenderer({});

    css2drenderer.domElement.style.position = "absolute";
    css2drenderer.domElement.style.top = "0px";
    css2drenderer.domElement.style.left = "0px";

    css2drenderer.setSize(window.innerWidth, window.innerHeight);
    // Set the size of the renderer to match the window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Set the pixel ratio for high-DPI displays (e.g., Retina)
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add the renderer's DOM element (canvas) to the HTML body
    element.appendChild(renderer.domElement);
    element.appendChild(css2drenderer.domElement);

    // --- Lighting Setup ---
    // AmbientLight: Illuminates all objects in the scene equally from all directions.
    // It doesn't cast shadows and is good for general scene brightness.
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // --- Animation Loop ---
    // This function will be called repeatedly to update the scene and render it.
    renderer.setClearColor(0xffffff);

    function animate() {
      // requestAnimationFrame tells the browser that you want to perform an animation
      // and requests that the browser calls a specified function to update an animation
      // before the next repaint. This is the most efficient way to animate.
      requestAnimationFrame(animate);
      // Render the scene from the perspective of the camera
      renderer.render(scene, camera);
      css2drenderer.render(scene, camera);
    }

    observeDivSizeChange(this.element, ({ width, height }) => {
      console.log("observeDivSizeChange", width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix(); // Update the camera's projection matrix
      renderer.setSize(width, height);
      css2drenderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio); // Re-apply pixel ratio
    });

    // Start the animation loop when the window loads
    window.onload = animate;

    this.tl = gsap.timeline({
      paused: true, // Start paused, will play later
    });

    this.world = scene;

    this.createProgressBar(this.tl);

    playAnimation(this.introElement, () => {
      this.play();
      this.doPlay();

      // this.tl.eventCallback("onComplete", () => {
      //   setTimeout(() => {
      //     playAnimation(this.outroElement, null);
      //   }, 3000);
      // });
    });
  }

  private createProgressBar(tl: gsap.core.Timeline | null = null) {
    const progressBarBox = document.createElement("div");
    progressBarBox.className = "ProgressBarBox";
    progressBarBox.style.cssText = ``;
    progressBarBox.innerHTML = `
      <div class="ProgressBar">
        <div class="ProgressBarProgress">
          <button />
        </div>
      </div>
    `;

    this.element.appendChild(progressBarBox);

    const buttons = document.createElement("div");
    buttons.className = "ProgressBarControls";
    buttons.innerHTML = `
      <a href="javascript:void(0)" class="Control Play" id="Controls-Play">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>
      </a>
      <a href="javascript:void(0)" class="Control Pause" id="Controls-Pause">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg>
      </a>
    `;

    progressBarBox.appendChild(buttons);

    const progressBar = progressBarBox.querySelector(
      ".ProgressBar",
    ) as HTMLDivElement;
    const progressBarProgress = progressBarBox.querySelector(
      ".ProgressBarProgress",
    ) as HTMLDivElement; // Get the inner div for the progress bar

    tl.eventCallback("onUpdate", () => {
      progressBarProgress.style.width = `${tl.progress() * 100}%`;
    });

    buttons.addEventListener("click", (event) => {
      event.stopPropagation();
      const el = event.target as HTMLDivElement;
      if (el.id === "Controls-Play") {
        tl.resume();
      } else {
        tl.pause();
      }
      buttons.classList.toggle("Playing");
    });

    progressBarBox.addEventListener("click", (event) => {
      // console.log(event.clientX, event.offsetX, event.pageX, event.x);
      const clickPercentage = event.offsetX / progressBar.clientWidth;
      tl.progress(clickPercentage);
    });
  }

  protected timeline: Timeline = { events: [] };

  protected appear<B extends THREE.Object3D, T extends Constructor<B>>(
    C: T,
    ...args: ConstructorArgs<T>
  ) {
    this.timeline.events.push({
      type: "appear",
      args: [C, args],
    });
  }

  private _appear<B extends THREE.Object3D, T extends Constructor<B>>(
    C: T,
    ...args: ConstructorArgs<T>
  ) {
    const t = new C(...args);
    /**
     * default:
     * for Canvas Objects, we use Tween to fade in.
     * for HTML Objects, we use Animation.css to fade in
     */
    this.world.add(t);

    if (t instanceof CSS2DObject) {
      t.element.firstElementChild?.classList.add(
        "animate__animated",
        "animate__fadeIn",
        "animate__zoomIn",
      );
    } else if (t instanceof THREE.Mesh) {
      gsap.fromTo(t.material, { opacity: 0, duration: 6 }, { opacity: 1 });
      gsap.fromTo(t.scale, { x: 0.8, y: 0.8, duration: 6 }, { x: 1, y: 1 });
    }
    return t;
  }

  protected disappear<B extends THREE.Object3D>() {
    this.timeline.events.push({
      type: "disappear",
      args: [],
    });
  }

  private _disappear<B extends THREE.Object3D>(t: B) {
    // this.world.remove(t);
    if (t instanceof CSS2DObject) {
      t.element.firstElementChild?.classList.add(
        "animate__animated",
        "animate__fadeOut",
        "animate__zoomOut",
      );
    } else if (t instanceof THREE.Mesh) {
      gsap.fromTo(t.material, { opacity: 1, duration: 6 }, { opacity: 0 });
      gsap.fromTo(t.scale, { x: 1, y: 1, duration: 6 }, { x: 0.8, y: 0.8 });
    }
  }

  protected wait(s: number = 1) {
    this.timeline.events.push({
      type: "wait",
      args: [s],
    });
  }

  /** after alive(), the elements created above will disappear. */
  protected alive(s: number) {
    this.timeline.events.push({
      type: "alive",
      args: [s],
    });
  }

  protected activity<T extends THREE.Object3D>(
    fn: (tl: gsap.core.Timeline, ...elements: T[]) => void,
  ) {
    this.timeline.events.push({
      type: "activity",
      args: [fn],
    });
  }

  /**
   * it's just a method to collect the actions
   */
  abstract play(): void;
  private doPlay() {
    const gapMs = 600;
    const clock = new THREE.Clock();

    const { events } = this.timeline;
    const aliveThings: Map<number, AliveThing> = new Map();

    let waitToAlive = [];
    let waitToActivity = [];

    let i = 0;

    const next = () => {
      const event = events[i];
      if (event === undefined) return;
      i++;

      if (processEvent(event) === 1) {
        // consider the time to fade in out
        setTimeout(next, gapMs);
      }
    };

    const time = () => {
      requestAnimationFrame(time);
      const now = clock.getElapsedTime();

      let at: AliveThing;
      for (let ent of aliveThings) {
        at = ent[1];
        const age = now - at.appearAt;
        at.age = age;
        if (at.lifetime === 0) continue;
        if (age >= at.lifetime) {
          this._disappear(at.t);
          aliveThings.delete(at.t.id);
        }
      }
    };

    const processEvent = (event: TimelineEvent) => {
      /** 1 - raf; 2 - setTimeout, ignore; 3 - wait gsap finished! */
      let howToNext = 1;

      switch (event.type) {
        case "appear": {
          const [C, args] = event.args;
          const t = this._appear(C, ...args);
          aliveThings.set(t.id, {
            t,
            age: 0,
            lifetime: 0,
            appearAt: clock.getElapsedTime(),
          });
          waitToAlive.push(t);
          waitToActivity.push(t);
          break;
        }
        case "disappear": {
          const t = waitToAlive.pop();
          waitToActivity.pop();
          if (!t) break;
          this._disappear(t);
          aliveThings.delete(t.id);
          break;
        }
        case "wait": {
          howToNext = 2;
          setTimeout(next, 1000 * event.args[0]);
          break;
        }
        case "alive": {
          howToNext = 2;
          const lifetime = event.args[0]; // s
          for (const t of waitToAlive) {
            const at = aliveThings.get(t.id);
            at.lifetime = at.age + lifetime;
          }
          waitToAlive = [];
          waitToActivity = [];
          setTimeout(next, 1000 * lifetime);
          break;
        }
        case "activity": {
          howToNext = 3;
          const activityFn = event.args[0]; // fn
          const tl = gsap.timeline({
            onComplete: onTlComplete,
          });
          activityFn(tl, ...waitToActivity);
          tl.play();
          waitToActivity = [];
          break;
        }
      }

      return howToNext;
    };

    const onTlComplete = () => {
      next();
    };

    clock.start();
    next();
    time();
  }

  resume() {}
  pause() {}
  stop() {}
  reset() {}
  seek(progress: number) {}
}

type AliveThing = {
  t: THREE.Object3D;
  age: number;
  appearAt: number;
  lifetime: number;
  disappearAt?: number;
};

type TimelineEventType = "appear" | "wait" | "alive" | "disappear" | "activity";

/**
 * @todo
 */
type TimelineEventTypeArgsMap = {
  appear: [];
};

type TimelineEvent = {
  type: TimelineEventType;
  args: any[];
};

type Timeline = {
  startAt?: number;
  endAt?: number;
  duration?: number;
  events: TimelineEvent[];
};

type Constructor<T = any> = new (...args: any[]) => T;
type ConstructorArgs<T extends Constructor> = T extends new (
  ...args: infer P
) => any
  ? P
  : never;
