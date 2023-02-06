import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode: any) {
  let component = { vnode, type: vnode.type, setupState: {}, props: {} };
  return component;
}

export function setupComponent(instance: any) {
  // TODO
  initProps(instance, instance.vnode.props);
  // initSlots();

  setupStateFulComponent(instance);
}

function setupStateFulComponent(instance: any) {
  const Component = instance.type;

  const { setup } = Component;

  // ctx
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props));

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  let Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
