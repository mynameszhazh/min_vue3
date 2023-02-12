import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", { name: "App", ...this.props }, [
      h("div", {}, "coutn" + this.count),
      h("button", { onClick: this.onclick }, "button"),
      h("button", { onClick: this.onPropsValuechange }, "props值发生改变"),
      h(
        "button",
        { onClick: this.onPropsValueToUndefined },
        "props值 => undefined"
      ),
      h(
        "button",
        { onClick: this.onProprsValueAllChange },
        "props值 => 重新赋值"
      ),
    ]);
  },
  setup() {
    const count = ref(0);
    const props = ref({
      bar: "bar",
      foo: "foo",
    });
    const onclick = () => {
      // console.log("onclick");
      count.value++;
    };
    const onPropsValuechange = () => {
      // console.log("onPropsValuechange");
      props.value.foo = "newBar";
    };
    const onPropsValueToUndefined = () => {
      // console.log("onclick");
      props.value.foo = undefined;
    };
    const onProprsValueAllChange = () => {
      // console.log("onclick");
      props.value = {
        foo: 'props',
      };
    };
    return {
      count: count,
      props,
      onProprsValueAllChange,
      onPropsValueToUndefined,
      onPropsValuechange,
      onclick,
    };
  },
};
