import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelper";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);

  createCodegenNode(root);

  root.helpers = [...context.helpers.keys()];
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}
function traverseNode(node: any, context: any) {
  // 执行一些指定的执行操作
  let nodeTransforms = context.nodeTransforms;
  let exitFns: any = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    let transform = nodeTransforms[i];
    // 这里执行一些外部需要执行的插件
    const onExit = transform(node, context);
    if (onExit) exitFns.push(onExit);
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // 引入一些导入的内容
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
      traverChildNode(node, context);
      break;
    case NodeTypes.ELEMENT:
      traverChildNode(node, context);
      break;
    default:
      break;
  }

  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

function traverChildNode(node: any, context) {
  let children = node.children;
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    traverseNode(childNode, context);
  }
}
function createCodegenNode(root) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}
