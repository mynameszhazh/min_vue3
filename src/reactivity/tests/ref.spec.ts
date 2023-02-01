import { effect } from "../effect";
import { ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    let ret = ref(1);
    expect(ret.value).toBe(1);
  });

  it("should be reactive", () => {
    // expect(2).toBe(3);
    let val = ref(1);
    let dumy;
    let calls = 0;
    effect(() => {
      calls++;
      dumy = val.value;
    });
    expect(calls).toBe(1);
    expect(dumy).toBe(1);
    val.value = 2;
    expect(calls).toBe(2);
    expect(dumy).toBe(2);
    // same value should not trigger
    val.value = 2;
    expect(calls).toBe(2);
    expect(dumy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    let wrapobj = ref({
      foo: 1,
    });
    let dumy;
    effect(() => {
      dumy = wrapobj.value.foo;
    });
    expect(dumy).toBe(1);
    wrapobj.value.foo = 2;
    expect(dumy).toBe(2);
  });
});
