import { isOwn } from "@xjh-mini-vue/shared";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    let { setupState, props } = instance;

    if (isOwn(setupState, key)) {
      return setupState[key];
    } else if (isOwn(props, key)) {
      return props[key];
    }

    let publicGetter = publicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
