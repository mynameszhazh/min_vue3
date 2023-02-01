import { extend } from "./../shared/index";

let activeEffect;
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?: Function) {
    this._fn = fn;
  }
  run() {
    // 如果不是响应式数据
    if (!this.active) {
      return this._fn();
    }

    activeEffect = this;
    shouldTrack = true;
    const ret = this._fn();
    shouldTrack = false;
    // this._fn();
    return ret;
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
  // 这里已经不存在内容了
  effect.deps.length = 0;
}

const targetMap = new Map();
export function track(target, key) {
  if(!isTracking()) return 

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
  // 双向数据保存
  if(dep.has(activeEffect)) return
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined
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

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  extend(_effect, options);

  _effect.run();

  let runner: any = _effect.run.bind(_effect);
  runner.effec = _effect;
  return runner;
}

export function stop(runner) {
  runner.effec.stop();
}
