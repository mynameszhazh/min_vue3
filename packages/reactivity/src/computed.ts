import { ReactiveEffect } from "./effect";
import { hasChanged } from "@xjh-mini-vue/shared";
export function computed(getter) {
  return new ComputeRefImpl(getter);
}

class ComputeRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;

  constructor(getter) {
    this._getter = getter;

    // 把 computed 的函数 当做一个 effect 一样使用
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}
