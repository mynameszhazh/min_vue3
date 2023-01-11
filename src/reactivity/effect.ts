import { extend } from './../shared/index';
class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?: Function) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    // this._fn();
    return this._fn();
  }

  stop() {
    if (this.active) {
      if (this.onStop) {
        this.onStop();
      }
      clearnEffect(this);
      this.active = false;
    }
  }
}

function clearnEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}

const targetMap = new Map();
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if(!activeEffect) return

  // 双向数据保存
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target, key) {
  if (targetMap.has(target)) {
    let depsMap = targetMap.get(target);
    if (depsMap.has(key)) {
      let deps = depsMap.get(key);
      for (let fn of deps) {
        if (fn.scheduler) {
          fn.scheduler();
        } else {
          fn.run();
        }
      }
    }
  }
}
let activeEffect;
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  extend(_effect, options)

  _effect.run();

  let runner: any = _effect.run.bind(_effect);
  runner.effec = _effect;
  return runner;
}

export function stop(runner) {
  runner.effec.stop();
}
