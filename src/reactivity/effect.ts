class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
    return this._fn;
  }
}

const targetMap = new Map();
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
}
export function trigger(target, key) {
  if (targetMap.has(target)) {
    let depsMap = targetMap.get(target);
    if (depsMap.has(key)) {
      let deps = depsMap.get(key);
      for (let fn of deps) {
        fn.run();
      }
    }
  }
}
let activeEffect;
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  let runner = _effect.run();
  return runner.bind(_effect);
}
