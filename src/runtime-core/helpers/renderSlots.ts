import { createVnode, Fragment } from "../vnode";

export function renderSlots(slots, key, props = {}) {
  let slot = slots[key];
  if (slot) {
    return createVnode(Fragment, {}, slot(props));
  }
}
