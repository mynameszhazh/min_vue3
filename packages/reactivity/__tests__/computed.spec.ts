import { computed } from "../src/computed";
import { reactive } from "../src/reactive";

describe("ref", () => {
  it("happy path", () => {
    // ref
    // .value
    // 缓存
    let ret = reactive({
      obj: 1,
    });
    let age = computed(() => {
      return ret.obj + 1;
    });
    expect(age.value).toBe(2);
  });

  it("should computed lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => value.foo);
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    // one
    expect(cValue.value).toBe(1);
    expect(getter).toHaveReturnedTimes(1);

    // two
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // three
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // four
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // five
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("", () => {});

  it("", () => {});

  it("", () => {});

  it("", () => {});
});
