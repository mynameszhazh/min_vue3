import { createVnode } from "../vnode";

export function renderSlots(slots, key, props = {}) {
  let slot = slots[key];
  if (slot) {
    return createVnode("div", {}, slot(props));
  }
}
