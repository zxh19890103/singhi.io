import { uglify } from "rollup-plugin-uglify";
import babel from 'rollup-plugin-babel';
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

module.exports = {
  input: 'index.js',
  output: {
    file: '../assets/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    commonjs({
      include: /node_modules/,
      namedExports: {
        '../node_modules/@babel/runtime/helpers/typeof.js': ['typeof']
      }
    }),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
      runtimeHelpers: true
    }),
    uglify({
      compress: {
        drop_console: true
      }
    }),
  ]
}
