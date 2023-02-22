import { genarator } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElment } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

export function baseCompaile(template) {
  const ast = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElment, transformText],
  });
  return genarator(ast);
}
