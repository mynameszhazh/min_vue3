import { createRenderer } from "../runtime-core";

function createElement(vnode) {
  // createRenderer()
  const el = (vnode.el = document.createElement(vnode.type));
  return el;
}

function insert(el, parent) {
  parent.appendChild(el);
}

function patchProp(el, key, preVal, newVal) {
  let isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase();
    el.addEventListener(event, newVal);
  }
  if (newVal === undefined || newVal === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, newVal);
  }
}

const renderer: any = createRenderer({
  createElement,
  insert,
  patchProp,
});

export function createApp(...arg) {
  return renderer.creatApp(...arg);
}

export * from "../runtime-core/index";
