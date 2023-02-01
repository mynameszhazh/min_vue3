import { mutableHandles, readonlyHandles, shallowReadonlyHandles } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function isReactive(obj) {
  return !!obj[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(obj) {
  return !!obj[ReactiveFlags.IS_READONLY];
}

export function reactive(obj) {
  return createActiveObject(obj, mutableHandles);
}

export function readonly(row) {
  return createActiveObject(row, readonlyHandles);
}

export function shallowReadonly(row) {
  return createActiveObject(row, shallowReadonlyHandles);
}

function createActiveObject(row, baseHandlers) {
  return new Proxy(row, baseHandlers);
}
