import { isReactive, reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const obj = { foo: 1 };
    const observed = reactive(obj);
    expect(observed).not.toBe(obj);
    expect(observed.foo).toBe(1);
    expect(isReactive(obj)).toBe(false);
    expect(isReactive(observed)).toBe(true);
  });

  test("nested reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
