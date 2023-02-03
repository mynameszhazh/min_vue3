import { render } from "./renderer";
import { createVnode } from "./vnode";

export function createApp(rootComponet) {
  return {
    mount(rootContainer) {
      // 先 vnode
      // component -> vnode
      // 所有逻辑操作 都会基于 vnode 做处理
      let vnode = createVnode(rootComponet);
      render(vnode, rootContainer);
    },
  };
}
