import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe("transform", () => {
  it.only("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");

    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += "xjh";
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const node = ast.children[0].children[0];
    expect(node.content).toBe("hi,xjh");
  });
});
