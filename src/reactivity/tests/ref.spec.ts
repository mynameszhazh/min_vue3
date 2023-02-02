import { effect } from "../effect";
import { reactive } from "../reactive";
import { ref, isRef, unRef, proxyRefs } from "../ref";

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

  it("isref", () => {
    let ret = 0;
    let ret1 = ref(1);
    let ret2 = reactive({ foo: 123 });
    expect(isRef(ret)).toBe(false);
    expect(isRef(ret1)).toBe(true);
    expect(isRef(ret2)).toBe(false);
  });

  it("unRef", () => {
    let ret = 1;
    let ret1 = ref(1);
    expect(unRef(ret)).toBe(1);
    expect(unRef(ret1)).toBe(1);
  });

  it("proxyRefs", () => {
    let obj = {
      foo: ref(1),
      name: "myname",
    };
    let proxyObj = proxyRefs(obj);
    expect(obj.foo.value).toBe(1);
    expect(proxyObj.name).toBe("myname");
    expect(proxyObj.foo).toBe(1);

    proxyObj.foo = 20;
    expect(proxyObj.foo).toBe(20);
    expect(obj.foo.value).toBe(20);
    // set -> ref .value

    proxyObj.foo = ref(10);
    expect(proxyObj.foo).toBe(10);
    expect(obj.foo.value).toBe(10);
  });
});
