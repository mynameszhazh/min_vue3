import { App } from "./App.js";
import { createApp } from "../../lib/guide-mini-vue.esm.js";

let container = document.querySelector("#app");
createApp(App).mount(container);
