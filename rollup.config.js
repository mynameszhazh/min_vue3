import typescript from "@rollup/plugin-typescript";
// import pkg from "./package.json";

export default {
  // input: "./src/index.ts",
  input:"./packages/vue/src/index.ts",
  output: [
    {
      format: "cjs",
      // file: pkg.main,
      file: "./packages/vue/dist/mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "./packages/vue/dist/mini-vue.esm-bundler.js",
      // file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
