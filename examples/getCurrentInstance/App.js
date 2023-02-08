import { h, createTextVnode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    return h("div", { name: "red" }, [h(Foo, { count: 1 }, "1234")]);
  },
  setup() {
    return {
      msg: 123,
    };
  },
};
