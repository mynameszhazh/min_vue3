import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    window.self = this;
    // return h("div", { id: "root", class: ["red"] }, "xjh 123");
    return h("div", { id: "root", class: ["red"] }, [
      h("h2", { class: "red" }, "h2"),
      h("span", { class: "blue" }, "我就是一个span" + this.msg),
    ]);
  },
  setup() {
    return {
      msg: 123,
    };
  },
};
