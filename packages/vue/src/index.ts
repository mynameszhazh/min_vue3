export * from "@xjh-mini-vue/runtime-dom";

import { baseCompaile } from "@xjh-mini-vue/compiler-core";
import * as runtimeDom from "@xjh-mini-vue/runtime-dom";
import { registerRuntimeCompiler } from "@xjh-mini-vue/runtime-dom";

function compaileToFunction(template) {
  const { code } = baseCompaile(template);

  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compaileToFunction);
