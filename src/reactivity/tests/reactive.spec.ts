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
});
