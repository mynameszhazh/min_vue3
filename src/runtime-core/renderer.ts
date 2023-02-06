import { ShapeFlags } from "./../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  container = document.querySelector(container);
  patch(vnode, container);
}

export function patch(vnode, container) {
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else {
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(ininalvnode, container) {
  let instance = createComponentInstance(ininalvnode);

  // 处理 setup
  setupComponent(instance);

  setupRenderEffect(instance, ininalvnode, container);
}

function setupRenderEffect(instance: any, ininalvnode, container) {
  let { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  ininalvnode.el = subTree.el;
}
function processElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));

  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // vonode
    mountChildren(vnode, el);
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

function mountChildren(vnode: any, container: any) {
  const { children } = vnode;
  children.forEach((v) => patch(v, container));
}
