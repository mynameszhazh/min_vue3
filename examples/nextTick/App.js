import {
  getCurrentInstance,
  h,
  nextTick,
  ref,
} from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();

    const changeCount = () => {
      for (let i = 0; i < 10; i++) {
        count.value = i;
      }
      nextTick(() => {
        console.log(instance, "instance");
      });
    };

    return { changeCount, count };
  },
  render() {
    return h("div", {}, [
      h("h2", {}, "hello"),
      h("button", { onClick: this.changeCount }, "changeCount"),
      h("p", {}, "count: " + this.count),
    ]);
  },
};
