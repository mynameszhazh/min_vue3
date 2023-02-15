import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlot";

export function createComponentInstance(vnode: any, parent: any) {
  // console.log(parent, "parent");
  let component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    next: null,
    // todo 这里不会出现原型链的问题
    provides: parent ? parent.provides : {},
    isMounted: false,
    subTree: null,
    parent,
    emit: () => {},
  };
  component.emit = emit as any;
  return component;
}

export function setupComponent(instance: any) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  setupStateFulComponent(instance);
}

function setupStateFulComponent(instance: any) {
  const Component = instance.type;

  const { setup } = Component;

  // ctx
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit.bind(null, instance),
    });
    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  let Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
