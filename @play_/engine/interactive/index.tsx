import React from "react";
import { type BaseInputProps, withBaseInput } from "./_base.js";

interface NumberProps extends BaseInputProps<number> {
  min?: number;
  max?: number;
}

// 1. Text Input
function TextInput(props: BaseInputProps<string>) {
  return (
    <input
      type="text"
      value={props.value}
      name={props.name}
      onChange={(e) => props.onChange(e.target.value)}
      disabled={props.disabled}
      className="w-full p-2 rounded-xl bg-white text-gray-700 outline-none"
    />
  );
}
export const CuteTextInput = withBaseInput(TextInput);

// 2. Number Slide Input (range)
function NumberSlideInput(props: NumberProps) {
  return (
    <input
      type="range"
      value={props.value}
      min={props.min}
      name={props.name}
      max={props.max}
      onChange={(e) => props.onChange(Number(e.target.value))}
      disabled={props.disabled}
      className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
    />
  );
}
export const CuteNumberSlideInput = withBaseInput(NumberSlideInput);

// 3. Float Number Input
function NumberInput(props: NumberProps) {
  return (
    <input
      type="number"
      step="any"
      name={props.name}
      value={props.value}
      min={props.min}
      max={props.max}
      onChange={(e) => props.onChange(Number(e.target.value))}
      disabled={props.disabled}
      className="w-full p-2 rounded-xl bg-white text-gray-700 outline-none"
    />
  );
}
export const CuteNumberInput = withBaseInput(NumberInput);

// 4. Integer Input
function IntegerInput(props: NumberProps) {
  return (
    <input
      type="number"
      step="1"
      name={props.name}
      value={props.value}
      min={props.min}
      max={props.max}
      onChange={(e) => props.onChange(Math.floor(Number(e.target.value)))}
      disabled={props.disabled}
      className="w-full p-2 rounded-xl bg-white text-gray-700 outline-none"
    />
  );
}
export const CuteIntegerInput = withBaseInput(IntegerInput);

// 5. Color Picker Input
function ColorInput(props: BaseInputProps<string>) {
  return (
    <input
      type="color"
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      disabled={props.disabled}
      className="w-full h-10 rounded-xl border-none cursor-pointer"
    />
  );
}
export const CuteColorInput = withBaseInput(ColorInput);

export * from "./form.js";
