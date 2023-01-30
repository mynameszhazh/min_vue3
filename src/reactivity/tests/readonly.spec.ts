import { readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it('warn then call readonly', () => {
    console.warn = jest.fn() 
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    wrapped.foo++
    expect(console.warn).toBeCalled()
  });
});