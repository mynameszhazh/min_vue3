import { Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  container = document.querySelector(container);
  patch(vnode, container, null);
}

export function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode, container, parentComponent) {
  let instance = createComponentInstance(initialVnode, parentComponent);

  // 处理 setup
  setupComponent(instance);

  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance: any, ininalvnode, container) {
  let { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container, instance);

  ininalvnode.el = subTree.el;
}
function processElement(vnode: any, container: any, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type));

  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // vonode
    mountChildren(vnode, el, parentComponent);
  }

  const { props } = vnode;
  for (let key in props) {
    const val = props[key];
    let isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase();
      el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
  }
  container.appendChild(el);
}

function mountChildren(vnode: any, container: any, parentComponent) {
  const { children } = vnode;
  children.forEach((v) => patch(v, container, parentComponent));
}

function processFragment(vnode: any, continuer: any, parentComponent) {
  mountChildren(vnode, continuer, parentComponent);
}
function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
