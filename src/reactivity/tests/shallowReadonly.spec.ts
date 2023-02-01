import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = shallowReadonly(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(wrapped.bar)).toBe(false);
  });

  // it("warn then call readonly", () => {
  // });
});
