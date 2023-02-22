import { App } from "./App.js";
import { createApp } from "../../dist/mini-vue.esm-bundler.js";

let container = document.querySelector("#app");
createApp(App).mount(container);
