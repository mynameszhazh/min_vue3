import { h } from "../../lib/guide-mini-vue.esm.js";

import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";
import ArrayToArray from "./ArrayToArray.js";

export const App = {
  setup() {},
  render() {
    return h("div", { tid: 1 }, [
      h("h1", {}, "老子是主页"),
      // 老的是 array 新的是 text
      // h(ArrayToText),
      // 老的是 text 新的是 text
      // h(TextToText),
      // 老的是 text 新的是 array
      // h(TextToArray),
      // 老的是 array 新的是 array
      h(ArrayToArray),
    ]);
  },
};
