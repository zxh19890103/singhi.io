import * as THREE from "three";
import { type CoreOptions, type ComposedOptions, type WithAnimations, DEFAULT_OPTIONS, type PublicOptions } from "./types.js";

export abstract class Points<P = {}>
  extends THREE.Points
  implements WithAnimations
{
  readonly options: ComposedOptions<P>;

  constructor(options: CoreOptions) {
    const _options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    super(getGeometry(_options), getMaterial(_options));

    this.options = _options as ComposedOptions<P>;
  }

  appear(duration: number): this {
    throw new Error("Method not implemented.");
  }
  fadeIn(duration: number): this {
    throw new Error("Method not implemented.");
  }
  fadeOut(duration: number): this {
    throw new Error("Method not implemented.");
  }
  popup(duration: number): this {
    throw new Error("Method not implemented.");
  }
  enlarge(duration: number): this {
    throw new Error("Method not implemented.");
  }
  shrink(duration: number): this {
    throw new Error("Method not implemented.");
  }
  disappear(duration: number): this {
    throw new Error("Method not implemented.");
  }
  move(offset: [number, number], duration: number): this {
    throw new Error("Method not implemented.");
  }
  moveTo(position: [number, number], duration: number): this {
    throw new Error("Method not implemented.");
  }
  rotate(angle: number, duration: number): this {
    throw new Error("Method not implemented.");
  }
  rotateTo(angle: number, duration: number): this {
    throw new Error("Method not implemented.");
  }
}

function getMaterial(options: CoreOptions) {
  if (options.materials) return options.materials;
  if (options.material) return options.material;
  return new THREE.PointsMaterial({ color: options.color });
}

function getGeometry(options: CoreOptions) {
  if (options.geometry) return options.geometry;
  return new THREE.BufferGeometry();
}
