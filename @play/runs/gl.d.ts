import { Chart as ChartClass } from "chart.js";

declare global {
  const Chart: typeof ChartClass;
}
