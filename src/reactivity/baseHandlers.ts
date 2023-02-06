import { extend, isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyHandlesGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    if (!isReadonly) {
      track(target, key);
    }

    const res = Reflect.get(target, key);

    if (shallow) {
      return res;
    }

    // 递归处理响应式
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandles = {
  get,
  set,
};

export const readonlyHandles = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key} is readonly`, target);
    return true;
  },
};

export const shallowReadonlyHandles = extend({}, readonlyHandles, {
  get: shallowReadonlyHandlesGet,
});
