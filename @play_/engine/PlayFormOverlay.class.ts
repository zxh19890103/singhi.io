import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import React, { createElement, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { JSX } from "react/jsx-runtime";

export type Placement = "top" | "bottom" | "left" | "right";

type SpyFn = () => Promise<void> | void;

export class PlayFormOverlay<S extends Record<string, any>> {
  private _state: S;
  private _el: HTMLElement;
  private _label: CSS2DObject;
  private _listeners: Map<keyof S, SpyFn[]> = new Map();
  private _render?: () => void;

  constructor(initialState: Partial<S>, placement: Placement = "top") {
    this._state = { ...(initialState as S) };
    this._el = document.createElement("div");
    this._el.className = "play-form";
    this._label = new CSS2DObject(this._el);
    this._label.position.set(0, 0, 0); // default offset
  }

  $for(obj: THREE.Object3D) {
    // if it's an css2d div

    if (obj instanceof CSS2DObject) {
      const el = obj.element;
      const rect = el.getBoundingClientRect();
      this._label.element.style.top = -rect.height / 2 + "px";
    }

    obj.add(this._label);
  }

  set<K extends keyof S>(key: K, value: S[K]) {
    this._state[key] = value;
    this._notify(key);
    this._render?.();
  }

  get<K extends keyof S>(key: K): S[K] {
    return this._state[key];
  }

  spy<K extends keyof S>(key: K, fn: SpyFn) {
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key)!.push(fn);
  }

  private _notify<K extends keyof S>(key: K) {
    const fns = this._listeners.get(key);
    if (fns) fns.forEach((fn) => fn());
  }

  createUI(builder: (ctx: this) => JSX.Element) {
    const Wrapper = () => {
      const [, forceUpdate] = useState(0);
      useEffect(() => {
        this._render = () => forceUpdate((n) => n + 1);
        return () => {
          this._render = undefined;
        };
      }, []);
      return React.createElement(
        "div",
        {},
        builder(this),
        React.createElement(
          "button",
          {
            onClick: () => {
              console.log("hi");
            },
          },
          "click",
        ),
      );
    };
    createRoot(this._el).render(createElement(Wrapper));
    return this;
  }
}

// Example usage:
// const form = new PlayFormDynamic({ health: 100, name: "Player" }, "top");
// form.createUI((ctx) => <CuteNumberInput label="HP" value={ctx.get("health")} onChange={v => ctx.set("health", v)} />);
