import { ShapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export const EMPTY_OBJ = {};

export function createVnode(type, props?, children?) {
  let vnode = {
    type,
    props,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    children,
  };

  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  // 组件 + children Object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

export function createTextVnode(text) {
  return createVnode(Text, {}, text);
}

function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
