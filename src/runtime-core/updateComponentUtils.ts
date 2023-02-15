export function shouldUpdateComponent(preVnode, nextVnode) {
  let { props: preProps } = preVnode;
  let { props: nextProps } = nextVnode;
  for (const key in nextProps) {
    if (nextProps[key] !== preProps[key]) {
      return true;
    }
  }
  return false;
}
