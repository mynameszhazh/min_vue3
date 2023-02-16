import { EMPTY_OBJ, Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { effect } from "../reactivity";
import { getSequence } from "../shared/myUtils";
import { shouldUpdateComponent } from "./updateComponentUtils";
import { queueJobs } from "./scheduler";

export function createRenderer(options) {
  let {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  // n1 => old vnode
  // n2 => new vnode
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anthor
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anthor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    // 拿出保存的实例对象
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(initialVnode, container, parentComponent, anthor) {
    let instance = (initialVnode.component = createComponentInstance(
      initialVnode,
      parentComponent
    ));

    // 处理 setup
    setupComponent(instance);

    setupRenderEffect(instance, initialVnode, container, anthor);
  }

  function setupRenderEffect(instance: any, ininalvnode, container, anthor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log("init");
          let { proxy } = instance;
          const subTree = instance.render.call(proxy);
          instance.subTree = subTree;
          patch(null, subTree, container, instance, anthor);

          ininalvnode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log("update");
          let { proxy, next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const subTree = instance.render.call(proxy);
          const preSubTree = instance.subTree;
          instance.subTree = subTree;
          patch(preSubTree, subTree, container, instance, anthor);
        }
      },
      {
        scheduler() {
          queueJobs(instance.update);
        },
      }
    );
  }
  function updateComponentPreRender(instance, nextVnode) {
    instance.vnode = nextVnode;
    instance.next = null;
    // console.log(instance, nextVnode);

    instance.props = nextVnode.props;
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // 更新操作
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement", container);
    // console.log("old", n1);
    // console.log("new", n2);
    let oldProps = n1.props || EMPTY_OBJ;
    let newProps = n2.props || EMPTY_OBJ;
    let el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 把老的 children 清空
        unmountChildren(n1.children);
      }
      // 2.直接 设置 text
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      } else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 1. 把老的 text children 清空
        hostSetElementText(container, "");
        // 2. 设置 arr
        mountChildren(c2, container, parentComponent, anchor);
      }
    }
  }

  // ! 如果有需要一定要好好复盘
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnthor
  ) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    function isSomeVnodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 左侧对比
    while (i <= e1 && i <= e2) {
      let n1 = c1[i];
      let n2 = c2[i];
      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnthor);
      } else {
        break;
      }
      i++;
    }
    // 右侧对比
    while (i <= e1 && i <= e2) {
      let n1 = c1[e1];
      let n2 = c2[e2];
      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnthor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新的比旧的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos >= l2 ? null : c2[nextPos].el;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
      // 旧的比新的多
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i;
      let s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;

      const keyToNewIndexMap = new Map();

      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      for (let i = s2; i < e1; i++) {
        let nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        let newIndex;
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVnodeType(prevChild, c2[j])) {
              newIndex = j;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 获取到最长递增子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (i !== increasingNewIndexSequence[j]) {
          console.log("移动位置");
          hostInsert(nextChild.el, container, anchor);
        } else {
          j--;
        }
      }
    }
    // console.log(i, e1, e2, "我就是一个 i哦 哦哦");
  }

  function unmountChildren(child) {
    for (let i = 0; i < child.length; i++) {
      const el = child[i].el;
      hostRemove(el);
    }
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

  function mountElement(n2, container, parentComponent, anchor) {
    // 初始化的赋值
    const el = (n2.el = hostCreateElement(n2));

    const { children, shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // vonode
      mountChildren(n2.children, el, parentComponent, anchor);
    }

    const { props } = n2;
    for (let key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    // container.appendChild(el);
    hostInsert(el, container, anchor);
  }

  function mountChildren(
    children: any,
    container: any,
    parentComponent,
    anthor
  ) {
    children.forEach((v) => patch(null, v, container, parentComponent, anthor));
  }

  function processFragment(
    n1,
    n2: any,
    continuer: any,
    parentComponent,
    anthor
  ) {
    mountChildren(n2.children, continuer, parentComponent, anthor);
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
