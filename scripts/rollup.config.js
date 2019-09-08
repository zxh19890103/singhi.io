import { uglify } from "rollup-plugin-uglify";

module.exports = {
  input: 'index.js',
  output: {
    file: '../assets/bundle.js',
    format: 'iife'
  },
  plugins: [
    uglify()
  ]
}
