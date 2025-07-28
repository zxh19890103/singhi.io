import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";

import { gsap } from "gsap";

import { observeDivSizeChange } from "./utils/index.js";
import { PlayForm } from "./PlayForm.class.js";
import { PlayFormOverlay } from "./PlayFormOverlay.class.js";
import type { JSX } from "react/jsx-runtime";
import * as core from "./core/types.js";
import { Arrow } from "./elements/index.js";

export abstract class PlayEngine {
  readonly controllerEnabled: boolean = true;
  readonly world: THREE.Scene;
  readonly mainTimeline: GSAPTimeline;

  readonly introOutroScreensContainer: HTMLDivElement;
  readonly interactFormContainer: HTMLDivElement;
  readonly controlsContainer: HTMLDivElement;

  readonly elementIntroSound: THREE.Audio;
  readonly elementOutroSound: THREE.Audio;

  constructor(readonly element: HTMLDivElement) {
    //#region threejs config
    // --- Scene Setup ---
    // A scene is where you set up what you want to render.
    const scene = new THREE.Scene();
    this.world = scene;

    const clientWidth = element.clientWidth;
    const clientHeight = element.clientHeight;

    // --- Camera Setup ---
    // A PerspectiveCamera is used to simulate how the human eye sees.
    // Parameters: Field of View (FOV), Aspect Ratio, Near Clipping Plane, Far Clipping Plane
    const camera = new THREE.PerspectiveCamera(
      75, // FOV: Vertical field of view in degrees
      clientWidth / clientHeight, // Aspect Ratio: Width divided by height
      1, // Near: Objects closer than this won't be rendered
      10000, // Far: Objects farther than this won't be rendered
    );

    // Position the camera back so we can see the cube
    camera.position.z = 800;

    // --- Renderer Setup ---
    // The WebGLRenderer renders your scene using WebGL.
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias for smoother edges
    const css2drenderer = new CSS2DRenderer({});

    css2drenderer.domElement.style.pointerEvents = "none";
    css2drenderer.domElement.style.position = "absolute";
    css2drenderer.domElement.style.top = "0px";
    css2drenderer.domElement.style.left = "0px";

    css2drenderer.setSize(window.innerWidth, window.innerHeight);
    // Set the size of the renderer to match the window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Set the pixel ratio for high-DPI displays (e.g., Retina)
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- Lighting Setup ---
    // AmbientLight: Illuminates all objects in the scene equally from all directions.
    // It doesn't cast shadows and is good for general scene brightness.
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // --- Animation Loop ---
    // This function will be called repeatedly to update the scene and render it.
    renderer.setClearColor(0xffffff);

    let controller: OrbitControls = null;
    if (this.controllerEnabled) {
      controller = new OrbitControls(camera, renderer.domElement);
      controller.enableDamping = true; // 开启惯性效果
      controller.dampingFactor = 0.05;
    }

    //#endregion

    //#region dom query & manipulations

    const introOutroScreensContainer = document.createElement("div");
    introOutroScreensContainer.className = "Screen";
    const interactFormContainer = document.createElement("div");
    interactFormContainer.className = "Interact controls-container";
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "Controls";

    this.introOutroScreensContainer = introOutroScreensContainer;
    this.interactFormContainer = interactFormContainer;
    this.controlsContainer = controlsContainer;

    element.classList.add("PlayCanvas");
    element.appendChild(renderer.domElement);
    element.appendChild(css2drenderer.domElement);
    element.appendChild(introOutroScreensContainer);

    observeDivSizeChange(this.element, ({ width, height }) => {
      console.log("observeDivSizeChange", width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix(); // Update the camera's projection matrix
      renderer.setSize(width, height);
      css2drenderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio); // Re-apply pixel ratio
    });
    //#endregion

    //#region  sounds

    {
      const audioLoader = new THREE.AudioLoader(new THREE.LoadingManager());
      const aLis = new THREE.AudioListener();
      camera.add(aLis);

      this.elementIntroSound = createSound(
        "/@play/sounds/mixkit-light-button-2580.wav",
        audioLoader,
        aLis,
      );
      this.elementOutroSound = createSound(
        "/@play/sounds/mixkit-page-turn-single-1104.wav",
        audioLoader,
        aLis,
      );
    }

    //#endregion

    //#region  animations

    function animate() {
      // requestAnimationFrame tells the browser that you want to perform an animation
      // and requests that the browser calls a specified function to update an animation
      // before the next repaint. This is the most efficient way to animate.
      requestAnimationFrame(animate);

      controller?.update();
      // Render the scene from the perspective of the camera
      renderer.render(scene, camera);
      css2drenderer.render(scene, camera);
    }

    // Start the animation loop when the window loads
    window.onload = animate;

    this.mainTimeline = gsap.timeline({
      paused: false, // Start paused, will play later
    });

    // Play right now
    this.introOutroScreensContainer.innerHTML =
      '<div class="ScreenBoard animate__animated animate__fadeIn">' +
      this.getIntroHTML() +
      "</div>";

    this.pause();
    this.play();

    this.introOutroScreensContainer.addEventListener("click", (event) => {
      const target = event.target as HTMLButtonElement;

      if (target.tagName === "BUTTON") {
        this.introOutroScreensContainer.style.display = "none";
        this.introOutroScreensContainer.innerHTML = ``;

        element.appendChild(interactFormContainer);
        element.appendChild(controlsContainer);

        buildControlsHTML();
        this.onInit();
        this.resume();

        const clock = new THREE.Clock();
        clock.start();

        for (const tl of this.timelines) {
          this.doPlay(tl, clock);
        }
      }
    });

    //#endregion

    function createSound(
      url: string,
      audioLoader: THREE.AudioLoader,
      aLis: THREE.AudioListener,
    ) {
      const sound = new THREE.Audio(aLis);

      audioLoader.load(url, (buffer) => {
        sound.setBuffer(buffer); // Set the loaded audio data to the sound source
        sound.setLoop(false); // Don't loop the sound effect
        sound.setVolume(0.7); // Set the volume (0.0 to 1.0)
        // Autoplay Policy: Remember that browsers typically require user interaction
        // before playing audio. So, this 'play()' might be better triggered by a button click.
        // For a seamless experience, ensure the user has interacted with the page first.
        // sound.play(); // Play the
      });

      return sound;
    }

    const buildControlsHTML = () => {
      this.controlsContainer.innerHTML = this.getControlsHTML();

      this.controlsContainer.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (target.tagName === "BUTTON") {
          if (target.classList.contains("pause-button")) {
            this.pause();
          } else if (target.classList.contains("resume-button")) {
            this.resume();
          }
        }
      });
    };
  }

  private getControlsHTML() {
    return `
    <button class="control-button pause-button">
      <span class="control-icon pause-icon"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg></span>
    </button>
    <button class="control-button resume-button">
      <span class="control-icon resume-icon"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg></span>
    </button>
    `;
  }

  protected getIntroHTML() {
    return `
    <h3 class="Title">Hello</h3>
    <div>
      <button class="play-button">
        <span class="play-icon">▶</span>
        <span class="button-text">Start</span>
      </button>
    </div>
    `;
  }

  protected getOutroHTML() {
    return `<div>Thanks!</div>`;
  }

  protected onInit() {}

  /**
   * the current
   */
  protected timeline: Timeline = null;
  protected timelines: Timeline[] = [];

  private pushTimelineEvent<K extends TimelineEventType>(
    type: K,
    args: TimelineEventTypeArgsMap[K],
  ) {
    Array.prototype.push.call(this.timeline.events, { type, args });
  }

  private elements = new Map<symbol, THREE.Object3D>();

  protected arrow(from: symbol, to: symbol) {
    console.log("arrow");
    this.pushTimelineEvent("arrow", [from, to]);
  }

  private _arrow() {}

  protected appear<B extends THREE.Object3D, T extends Constructor<B>>(
    C: T,
    pos: core.Pos,
    angle: core.Angle,
    ...args: ConstructorArgs<T>
  ) {
    const id = Symbol(`id for an instance of ${C.name}`);
    this.pushTimelineEvent("appear", [C, id, pos, angle, args]);
    return id;
  }

  private _appear<B extends THREE.Object3D, T extends Constructor<B>>(
    C: T,
    id: symbol,
    pos: core.Pos,
    angle: core.Angle,
    ...args: ConstructorArgs<T>
  ) {
    const t = new C(...args);
    this.elements.set(id, t);
    t.position.set(...pos);
    t.rotation.z = angle * THREE.MathUtils.DEG2RAD;

    /**
     * default:
     * for Canvas Objects, we use Tween to fade in.
     * for HTML Objects, we use Animation.css to fade in
     */
    this.world.add(t);
    this.elementIntroSound.play();

    if (t instanceof CSS2DObject) {
      gsap.to(t.element, { opacity: 1 });
    } else if (t instanceof THREE.Mesh) {
      const opacity = t.material.opacity;
      gsap.fromTo(t.material, { opacity: 0 }, { opacity, duration: 1 });
    }
    return t;
  }

  protected getElement(id: symbol) {}
  protected deleteElement(id: symbol) {}

  /**
   * @param id optional, if provided, disapear the element whose id equals to this, otherwise, choose the last element just created!
   */
  protected disappear(id: symbol, ...more: symbol[]) {
    this.pushTimelineEvent("disappear", [id, ...more]);
  }

  private _disappear<B extends THREE.Object3D>(t: B) {
    this.elementOutroSound.play();

    if (t instanceof CSS2DObject) {
      gsap.to(t.element, { opacity: 0 });
    } else if (t instanceof THREE.Mesh) {
      gsap.to(t.material, { opacity: 0, duration: 1 });
    }
  }

  protected wait(s: number = 1) {
    this.pushTimelineEvent("wait", [s]);
  }

  /** after alive(), the elements created above will disappear. */
  protected alive(s: number, ...ids: symbol[]) {
    this.pushTimelineEvent("alive", [s, ...ids]);
  }

  protected activity(fn: ActivityFn, ...ids: symbol[]) {
    this.pushTimelineEvent("activity", [, ...ids]);
  }

  protected interact(fn: InteractFn, ...ids: symbol[]) {
    this.pushTimelineEvent("interact", [fn, ...ids]);
  }

  protected interactWith(
    ui: InteractUIBuilder,
    fn: InteractWithFn,
    ...ids: symbol[]
  ) {
    this.pushTimelineEvent("interactWith", [ui, fn, ...ids]);
  }

  public playForm: PlayForm = new PlayForm();
  private tlId = 1989;
  /**
   * create a timeline, then all the next events will be pushed into it.
   * if there's a `currentTl`, then, it will be closed!
   */
  protected thread() {
    // end the current
    this.timeline = null;

    const id = this.tlId++;
    const tl: Timeline = { id: id, events: [], state: "paused" };
    this.timeline = tl;
    this.timelines.push(tl);
  }

  /**
   * it's just a method to collect the actions
   */
  abstract play(): void;
  private doPlay(tl: Timeline, clock: THREE.Clock) {
    const gapDur = 1;

    const { events } = tl;
    const aliveThings: Map<number, AliveThing> = new Map();

    let eventCursor = 0;

    const next = () => {
      console.log("next is called !", timer_label);

      const event = events[eventCursor];

      if (event === undefined) {
        console.log("no more event!");
        return;
      }

      eventCursor++;

      if (processEvent(event) === 1) {
        _delayNext("gap", gapDur);
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
          const [C, id, pos, angle, args] = event.args;
          const t = this._appear(C, id, pos, angle, ...args);
          aliveThings.set(t.id, {
            t,
            age: 0,
            lifetime: 0,
            appearAt: clock.getElapsedTime(),
          });
          break;
        }
        case "disappear": {
          const [id] = event.args;
          const t = this.elements.get(id);
          if (!t) {
            console.warn(`The element you are finding does not exist.`);
            break;
          }
          this._disappear(t);
          aliveThings.delete(t.id);
          break;
        }
        case "wait": {
          howToNext = 2;
          _delayNext("wait", event.args[0]);
          break;
        }
        case "alive": {
          howToNext = 2;
          const [lifetime, ...ids] = event.args; // s
          const elements = ids.map((id) => this.elements.get(id));
          for (const t of elements) {
            const at = aliveThings.get(t.id);
            at.lifetime = at.age + lifetime;
          }

          _delayNext("wait to die", lifetime);
          break;
        }
        case "activity": {
          howToNext = 3;
          const [activityFn, ...ids] = event.args; // fn
          const tl = gsap.timeline();
          activityFn(tl, ...ids.map((id) => this.elements.get(id)));
          this.mainTimeline.add(tl);
          onTlComplete(tl);
          break;
        }
        case "interact": {
          howToNext = 3;

          const [interactFn, ...ids] = event.args; // fn
          const tl = gsap.timeline();

          this.playForm.focus();
          this.pause();
          /**
           * may be has a bug?
           */
          interactFn(
            this.playForm,
            tl,
            ...ids.map((id) => this.elements.get(id)),
          );
          this.playForm.wait().then(() => {
            this.resume();
            onTlComplete(tl);
          });
          tl.play();
          break;
        }
        case "interactWith": {
          howToNext = 3;

          const [ui, interactFn, ...ids] = event.args; // fn
          const elements = ids.map((id) => this.elements.get(id));
          const tl = gsap.timeline();

          const first = elements[0];

          const playForm = new PlayFormOverlay({}, "top").createUI(ui);
          this.pause();
          playForm.$for(first);
          interactFn(playForm, tl, ...elements);
          tl.play();
          break;
        }
        case "arrow": {
          console.log("arrow line");
          const [from, to] = event.args;
          const el0 = this.elements.get(from);
          const el1 = this.elements.get(to);
          this.world.add(new Arrow(el0.position, el1.position));
          break;
        }
      }

      return howToNext;
    };

    const onTlComplete = (tl: gsap.core.Timeline) => {
      if (tl.isActive()) {
        tl.eventCallback("onComplete", () => {
          _delayNext("gsap complete", 0);
        });
      } else {
        _delayNext("gsap complete", 0);
      }
    };

    let timer = null;
    let timer_remaining_sec: number = 0;
    let timer_at_sec: number = 0;
    let timer_label: string = null;

    const _clearDelayNextState = () => {
      timer = null;
      timer_label = null;
      timer_remaining_sec = 0;
      timer_at_sec = 0;
    };

    /**
     * by this, we can pause it!
     * @param fn
     * @param s sec
     * @param params
     */
    const _delayNext = (label: string, s: number) => {
      if (timer !== null) {
        console.log(`${timer_label} #${timer} | ${label} what?`);
      }

      if (s <= 0) {
        console.log(`${label} delay = ${s}, called it immediately`);
        next();
        _clearDelayNextState();
        return;
      }

      const _fn = () => {
        console.log(`tl#${tl.id} timer#${timer} [${label}] timeout, call it!`);
        next();
        _clearDelayNextState();
      };

      timer_label = label;
      timer_remaining_sec = s;
      timer_at_sec = clock.getElapsedTime();
      timer = setTimeout(_fn, s * 1000);

      console.log(
        `tl#${tl.id} timer#${timer} [${label}] fired at ${timer_at_sec}s, and ${s}s remaining!`,
      );
    };

    time();

    console.log(`tl#${tl.id} is running`);
    _delayNext("start", 0);

    tl.pause = () => {
      tl.state = "paused";
      console.log(`tl#${tl.id} is paused`);
      if (timer === null) {
        console.log(`tl#${tl.id} no timer!`);
      } else {
        clearTimeout(timer);
        /**
         * seconds have passed since the last created!
         */
        const sec = clock.getElapsedTime() - timer_at_sec;

        timer_remaining_sec -= sec;
        if (timer_remaining_sec < 0) {
          timer_remaining_sec = 0;
        }

        console.log(
          `tl#${tl.id} there's a timer#${timer}, clear it; ${timer_remaining_sec}s remaining!`,
        );
      }
    };

    tl.resume = () => {
      tl.state = "playing";
      console.log(`tl#${tl.id} is resumed`);

      if (timer) {
        _delayNext(timer_label, timer_remaining_sec);

        console.log(
          `tl#${tl.id} there's a timer#${timer} [${timer_label}], continue it; ${timer_remaining_sec}s remaining!`,
        );
      } else {
        console.log(`tl#${tl.id} no timer!`);
      }
    };
  }

  //#region  animations
  fadein(status: symbol, arg1: number) {}
  place(controlCenter: symbol, arg1: string, edgeDevice: symbol) {}
  popup(sensor: symbol, arg1: number) {
    console.log("not implemented!");
  }
  move(edgeDevice: symbol, arg1: string, arg2: number[], arg3: number) {}
  //#endregion

  resume() {
    console.log("resume");
    this.mainTimeline.resume();

    for (const tl of this.timelines) tl.resume?.();

    this.controlsContainer.classList.toggle("paused");
    this.interactFormContainer.classList.toggle("paused");
  }

  pause() {
    console.log("pause");
    this.mainTimeline.pause();

    for (const tl of this.timelines) tl.pause?.();

    this.controlsContainer.classList.toggle("paused");
    this.interactFormContainer.classList.toggle("paused");
  }
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

type ActivityFn = (
  tl: gsap.core.Timeline,
  ...elements: THREE.Object3D[]
) => void;

type InteractFn = (
  form: PlayForm,
  tl: gsap.core.Timeline,
  ...elements: THREE.Object3D[]
) => void;

type InteractUIBuilder = (...args: any[]) => JSX.Element;

type InteractWithFn = (
  form: PlayFormOverlay<Record<string, any>>,
  tl: gsap.core.Timeline,
  ...elements: THREE.Object3D[]
) => void;

type TimelineEventTypeArgsMap = {
  appear: [any, symbol, core.Pos, core.Angle, any[]];
  wait: [number];
  arrow: [symbol, symbol];
  alive: [number, ...symbol[]];
  disappear: [symbol, ...symbol[]];
  activity: [ActivityFn, ...symbol[]];
  interact: [InteractFn, ...symbol[]];
  interactWith: [InteractUIBuilder, InteractWithFn, ...symbol[]];
};

type TimelineEventType = keyof TimelineEventTypeArgsMap;
type TimelineEventTypeEventMap = {
  [K in keyof TimelineEventTypeArgsMap]: {
    type: K;
    args: TimelineEventTypeArgsMap[K];
  };
};

type TimelineEvent = TimelineEventTypeEventMap[TimelineEventType];

type Timeline = {
  id: number;
  startAt?: number;
  endAt?: number;
  duration?: number;
  state: "playing" | "paused";
  pause?: () => void;
  resume?: () => void;
  events: TimelineEvent[];
};

type Constructor<T = any> = new (...args: any[]) => T;
type ConstructorArgs<T extends Constructor> = T extends new (
  ...args: infer P
) => any
  ? P
  : never;
