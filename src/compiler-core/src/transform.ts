export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}
function traverseNode(node: any, context: any) {
  // 执行一些指定的执行操作
  let nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    let transform = nodeTransforms[i];
    transform(node);
  }

  traverChildNode(node, context);
}

function traverChildNode(node: any, context) {
  let children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const childNode = children[i];
      traverseNode(childNode, context);
    }
  }
}
