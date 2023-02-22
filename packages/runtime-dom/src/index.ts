import { createRenderer } from "@xjh-mini-vue/runtime-core";

function createElement(vnode) {
  // createRenderer()
  const el = (vnode.el = document.createElement(vnode.type));
  return el;
}

function insert(child, parent, anthor) {
  // parent.appendChild(el);
  parent.insertBefore(child, anthor || null);
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

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  // console.log(el, text);
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  insert,
  patchProp,
  remove,
  setElementText,
});

export function createApp(...arg) {
  return renderer.creatApp(...arg);
}

export * from "@xjh-mini-vue/runtime-core";
