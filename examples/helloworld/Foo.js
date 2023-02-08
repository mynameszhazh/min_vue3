import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    // return h("div", { id: "root", class: ["red"] }, "foo: " + this.count);

    let foo = h("h1", { class: "red" }, "red");
    return h(
      "div",
      {
        name: "Foo",
        onClick: () => {
          this.emitAdd();
        },
      },
      [
        renderSlots(this.$slots, "footer"),
        foo,
        renderSlots(this.$slots, "header", { age: "1234" }),
      ]
    );
  },
  setup(props, { emit }) {
    // console.log(props, "1324");
    const emitAdd = () => {
      // console.log("emitAdd");
      emit("add", 1, 2);
    };
    return {
      emitAdd,
    };
  },
};
