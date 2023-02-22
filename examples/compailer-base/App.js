import { ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  template: `<div>hi,{{message}} -> count: {{ count}}</div>`,
  setup() {
    const count = ref(1);
    // 通过 vue 控制台调用
    window.count = count;
    return {
      count,
      message: "xjh",
    };
  },
};
