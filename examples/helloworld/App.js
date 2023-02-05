import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", "xjh 123" + this.msg);
  },
  setup() {
    return {
      msg: 123,
    };
  },
};
