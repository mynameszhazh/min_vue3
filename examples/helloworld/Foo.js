import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    return h("div", { id: "root", class: ["red"] }, "foo: " + this.count);
  },
  setup(props) {
    console.log(props, "1324");
  },
};
