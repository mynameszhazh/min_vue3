import { mutableHandles, readonlyHandles } from "./baseHandlers";

export function reactive(obj) {
  return createActiveObject(obj, mutableHandles);
}

export function readonly(row) {
  return createActiveObject(row, readonlyHandles);
}

function createActiveObject(row, baseHandlers) {
  return new Proxy(row, baseHandlers);
}
