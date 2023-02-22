export * from "./runtime-dom/index";

import { baseCompaile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom/index";
import { registerRuntimeCompiler } from "./runtime-dom/index";
function compaileToFunction(template) {
  const { code } = baseCompaile(template);

  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compaileToFunction);
