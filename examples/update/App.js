import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", {}, [
      h("div", {}, "coutn" + this.count),
      h("button", { onClick: this.onclick }, "button"),
    ]);
  },
  setup() {
    const count = ref(0);
    const onclick = () => {
      // console.log("onclick");
      count.value++;
    };
    return {
      count: count,
      onclick,
    };
  },
};
