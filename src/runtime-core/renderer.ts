import { EMPTY_OBJ, Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { effect } from "../reactivity";

export function createRenderer(options) {
  let {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  // n1 => old vnode
  // n2 => new vnode
  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVnode, container, parentComponent) {
    let instance = createComponentInstance(initialVnode, parentComponent);

    // 处理 setup
    setupComponent(instance);

    setupRenderEffect(instance, initialVnode, container);
  }

  function setupRenderEffect(instance: any, ininalvnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        let { proxy } = instance;
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;
        patch(null, subTree, container, instance);

        ininalvnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        let { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance);
      }
    });
  }
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      // 更新操作
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    // console.log("patchElement", container);
    console.log("old", n1);
    console.log("new", n2);
    let oldProps = n1.props || EMPTY_OBJ;
    let newProps = n2.props || EMPTY_OBJ;
    let el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          const prevProp = oldProps[key];
          if (!(key in newProps)) {
            hostPatchProp(el, key, prevProp, null);
          }
        }
      }
    }
  }

  function mountElement(n2, container, parentComponent) {
    // 初始化的赋值
    const el = (n2.el = hostCreateElement(n2));

    const { children, shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // vonode
      mountChildren(n2, el, parentComponent);
    }

    const { props } = n2;
    for (let key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    // container.appendChild(el);
    hostInsert(el, container);
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    const { children } = vnode;
    children.forEach((v) => patch(null, v, container, parentComponent));
  }

  function processFragment(n1, n2: any, continuer: any, parentComponent) {
    mountChildren(n2, continuer, parentComponent);
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  return {
    creatApp: createAppApi(render),
  };
}
