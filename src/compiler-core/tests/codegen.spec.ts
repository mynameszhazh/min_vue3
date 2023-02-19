import { genarator } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { transformElment } from "../src/transforms/transformElement";
import { transformExpression } from "../src/transforms/transformExpression";

describe("code gen", () => {
  it("happy path", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = genarator(ast);

    // 快照
    // 1. 抓bug
    // 2. 有意
    expect(code).toMatchSnapshot();
  });

  it("innser codeGen", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      // 用到插值 才使用transformExpression
      nodeTransforms: [transformExpression],
    });
    const { code } = genarator(ast);

    expect(code).toMatchSnapshot();
  });
  it.only("element", () => {
    const ast = baseParse("<div>hi, {{message}}</div>");
    transform(ast, {
      nodeTransforms: [transformElment],
    });
    const { code } = genarator(ast);

    expect(code).toMatchSnapshot();
  });
});
