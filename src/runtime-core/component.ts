export function createComponentInstance(vnode: any) {
  let component = { vnode, type: vnode.type };
  return component;
}

export function setupComponent(instance: any) {
  // TODO
  // initProps();
  // initSlots();

  setupStateFulComponent(instance);
}

function setupStateFulComponent(instance: any) {
  const Component = instance.type;

  const { setup } = Component;

  if (setup) {
    const setupResult = setup();

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
