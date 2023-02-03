export function createVnode(type, props?, children?) {
  let vnode = {
    type,
    props,
    children,
  };
  return vnode;
}
