import { isObject, hasChanged } from "./../shared/index";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep: Set<any>;
  private _rawValue: any;
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
