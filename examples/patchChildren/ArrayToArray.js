import { h, ref } from "../../lib/guide-mini-vue.esm.js";

// 左侧的对比
// (a b)c
// (a b)d e
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const prevChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
// ];

// 右侧的对比
// a(b c)
// d e(b c)
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const prevChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];

// 新的比旧的多 左侧对比
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const prevChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ];

// 新的比旧的多 右侧对比
// const nextChildren = [
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ];
// const prevChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];

// 新的比旧的多 右侧对比
const nextChildren = [
  // h("div", { key: "C" }, "C"),
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
];
const prevChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "c" }, "c"),
  h("div", { key: "d" }, "d"),
];

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
