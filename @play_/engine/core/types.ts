import * as THREE from "three";

export type Pos = [number, number, number?];
export type Angle = number;
export type Size = [number, number, number?];

export type AnimationType =
  | "appear"
  | "fadein"
  | "fadeout"
  | "popup"
  | "enlarge"
  | "shrink"
  | "disappear"
  | "move"
  | "moveTo"
  | "rotate"
  | "rotateTo";

export interface WithAnimations {
  appear(duration: number): this;
  fadeIn(duration: number): this;
  fadeOut(duration: number): this;
  popup(duration: number): this;
  enlarge(duration: number): this;
  shrink(duration: number): this;
  disappear(duration: number): this;
  move(offset: [number, number], duration: number): this;
  moveTo(position: [number, number], duration: number): this;
  rotate(angle: number, duration: number): this;
  rotateTo(angle: number, duration: number): this;
}

export type CoreOptions = {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
  materials?: THREE.Material[];
  color?: THREE.ColorRepresentation;
};

export type PublicOptions = {
  label?: string;
  alpha?: number;
};

export const DEFAULT_OPTIONS: CoreOptions = {
  color: 0x000000,
};

export type ComposedOptions<E extends Obj = {}> = E &
  PublicOptions &
  CoreOptions;

export type InputOptions<E extends Obj = {}> = E & PublicOptions;

type Obj = Record<string, any>;
