import { getCurrentInstance } from "./component";

export function provide(key, val) {
  let currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent?.provides;
    // todo 下面两个为什么
    // init
    if (provides === parentProvides) {
      // 原型链操作
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = val;
  }
}

export function inject(key, defaultValue) {
  let currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      } else return defaultValue;
    }
  }
}
