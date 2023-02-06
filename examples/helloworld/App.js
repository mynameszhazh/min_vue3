import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    window.self = this;

    // hello world
    // return h("div", { id: "root", class: ["red"] }, "xjh 123");

    // 递归处理
    // return h("div", { id: "root", class: ["red"] }, [
    //   h("h2", { class: "red" }, "h2"),
    //   h("span", { class: "blue" }, "我就是一个span" + this.msg),
    // ]);

    // 事件触发
    // return h(
    //   "div",
    //   {
    //     id: "root",
    //     class: ["red"],
    //     onClick() {
    //       console.log("click");
    //     },
    //     onMousedown() {
    //       console.log("onMousedown");
    //     },
    //   },
    //   "xjh 123"
    // );

    // 组件嵌套 + props + emit
    return h("div", { class: ["red"] }, [
      h("h2", {}, "h2h2h2h"),
      h(Foo, {
        count: 2,
        'on-add': (e, a) => {
          console.log("onAdd", e, a);
        },
      }),
    ]);
  },
  setup() {
    return {
      msg: 123,
    };
  },
};
