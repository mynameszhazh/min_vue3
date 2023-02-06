import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    // return h("div", { id: "root", class: ["red"] }, "foo: " + this.count);

    return h(
      "div",
      {
        onClick: () => {
          this.emitAdd();
        },
      },
      "emit"
    );
  },
  setup(props, { emit }) {
    console.log(props, "1324");
    const emitAdd = () => {
      console.log("emitAdd");
      emit("add", 1, 2);
    };
    return {
      emitAdd,
    };
  },
};
