import { CREAT_ELEMENT_VNODE } from "./runtimeHelper";

export const enum NodeTypes {
  INTERPOLATION,
  TEXT,
  SIMPLE_EXPRESSION,
  ELEMENT,
  ROOT,
  COMPOUND_EXPRESSION,
}

export function createVnodeCall(context, vnodeTag, vnodeProps, vnodeChildren) {
  context.helper(CREAT_ELEMENT_VNODE);
  return {
    type: NodeTypes.ELEMENT,
    tag: vnodeTag,
    props: vnodeProps,
    children: vnodeChildren,
  };
}
