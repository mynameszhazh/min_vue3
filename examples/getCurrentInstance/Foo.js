import { getCurrentInstance, h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    return h("div", {}, "foo");
  },
  setup() {
    let instance = getCurrentInstance();
    console.log(instance, 'instance');
  },
};
