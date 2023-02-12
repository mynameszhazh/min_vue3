import { h, ref } from "../../lib/guide-mini-vue.esm.js";
const nextChildren = [h("div", {}, "C"), h("div", {}, "D")];
const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];

export default {
  name: "ArrayToText",
  setup() {
    const ischange = ref(false);
    window.ischange = ischange;
    return {
      ischange,
    };
  },
  render() {
    const self = this;
    return self.ischange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
