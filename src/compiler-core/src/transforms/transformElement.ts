import { NodeTypes } from "../ast";
import { CREAT_ELEMENT_VNODE } from "../runtimeHelper";

export function transformElment(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    context.helper(CREAT_ELEMENT_VNODE);
  }
}
