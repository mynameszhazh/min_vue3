import { isObject, hasChanged } from "./../shared/index";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  public dep: Set<any>;
  public _v_isRef = true;
  private _rawValue: any;
  private _value: any;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    // 不是 effect 中的 直接返回值
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(this._rawValue, newValue)) {
      this._value = convert(newValue);
      this._rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(val) {
  return new RefImpl(val);
}

export function isRef(ref) {
  return !!ref._v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, newValue) {
      // 只有这样才需要直接赋值
      if (isRef(target[key]) && !isRef(newValue)) {
        return (target[key].value = newValue);
      }
      return Reflect.set(target, key, newValue);
    },
  });
}
