import { h, inject, createApp, provide } from "../../lib/guide-mini-vue.esm.js";

const Provide = {
  render() {
    return h("div", { name: "red" }, [h(Provide2, { count: 1 }, "1234")]);
  },
  setup() {
    provide("bar", "redbar");
  },
};

const Provide2 = {
  render() {
    return h("div", { name: "red" }, [h(Inject, { count: 1 }, "1234")]);
  },
  setup() {
    let bar = inject("bar2", () => "12341234");
    console.log(bar, "pro2 bar");
    provide("foo", "redfoo");
    provide("bar", "providebar");
  },
};

const Inject = {
  render() {
    return h("div", {}, "foo");
  },
  setup() {
    let foo = inject("foo");
    let bar = inject("bar");
    console.log(foo, bar, "foo bar");
  },
};

createApp(Provide).mount("#app");
