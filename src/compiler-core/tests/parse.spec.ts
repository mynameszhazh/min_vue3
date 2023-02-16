import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("parse", () => {
  // 插值
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{message }}");

      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });

  // element
  describe("element", () => {
    test("simple element div", () => {
      const ast = baseParse("<div></div>");

      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
      });
    });
  });
});
