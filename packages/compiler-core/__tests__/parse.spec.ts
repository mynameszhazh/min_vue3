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
        children: [],
      });
    });
  });

  // text
  describe("text", () => {
    test("simple text msg", () => {
      const ast = baseParse("some text");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text",
      });
    });
  });

  test("hello world", () => {
    const ast = baseParse("<p>hi,{{message}}</p>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "p",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  test("nestd elemnt ", () => {
    const ast = baseParse("<p><div>hi</div>123{{message}}</p>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "p",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "div",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeTypes.TEXT,
          content: "123",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  test.only("should throw error when lack end tag", () => {
    expect(() => {
      baseParse("<p><span></p>");
    }).toThrow(`缺少结束标签:span`);
  });
});
