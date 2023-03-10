import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREAT_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelper";

export function genarator(ast) {
  let context: any = createCodegenContext();
  let { push } = context;

  genFunctionPreamble(context, ast);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}){`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}
function genFunctionPreamble(context: any, ast: any) {
  const VueBinging = "Vue";
  let { push } = context;
  let aliasHelpers = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${VueBinging}`
    );
  }
  push("\n");
  push("return ");
}

function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterprolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompundExpression(node, context);
      break;
    default:
      break;
  }
}

function genCompundExpression(node, context) {
  const { children } = node;
  const { push } = context;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context;
  const { tag, props, children } = node;
  // push(`${helper(CREAT_ELEMENT_VNODE)}('${tag}', ${props}, `);
  push(`${helper(CREAT_ELEMENT_VNODE)}(`);
  genNodeList(genNullableArgs([tag, props, children]), context);
  // genNode(children, context);

  push(")");
}

function genNodeList(nodes: any, context: any) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isString(node)) {
      push(`${node}`);
    } else {
      genNode(node, context);
    }
    // node ??? node ?????????????????? ??????(,)
    // ??????????????????????????? "div", [props], [children]
    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullableArgs(args) {
  // ????????????null ???????????????
  // vue3????????????????????????????????? patchFlag???dynamicProps ????????????????????????
  // ?????????????????????????????????????????????????????????????????????????????????
  let i = args.length;
  // ?????? i-- ??????????????????????????????
  // ??????0 ?????????????????????????????????
  while (i--) {
    if (args[i] != null) break;
  }

  // ?????? falsy ?????????????????? "null"
  return args.slice(0, i + 1).map((arg) => arg || "null");
}

function createCodegenContext(): { push: any } {
  let context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
function genText(node: any, context: any) {
  let { push } = context;
  push(`'${node.content}'`);
}

function genInterprolation(node: any, context: any) {
  let { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node: any, context: any) {
  let { push } = context;
  push(`${node.content}`);
}
