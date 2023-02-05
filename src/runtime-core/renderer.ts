import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  container = document.querySelector(container);
  patch(vnode, container);
}

export function patch(vnode, container) {
  if (typeof vnode.type === "string") {
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

  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // vonode
    mountChildren(vnode, el);
  }

  const { props } = vnode;
  for (let key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.appendChild(el);
}

function mountChildren(vnode: any, container: any) {
  const { children } = vnode;
  children.forEach((v) => patch(v, container));
}
