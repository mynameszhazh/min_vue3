const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    let { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }

    let publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
