import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should retrun runner when call effec", () => {
    const ob = reactive({
      foo: 123,
    });
    let num;
    let runner = effect(() => {
      num = ob.foo + 1;
      return "foo";
    });

    expect(num).toBe(124);
    expect(runner()).toBe("foo");
  });

  it("scheduler", () => {
    let dummy;
    let run;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    let obj = reactive({
      foo: 1,
    });

    let runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    obj.foo++;
    obj.foo++;
    expect(scheduler).toBeCalledTimes(3);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(4);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3;
    obj.prop++
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const onStop = jest.fn();
    const runner = effect(
      () => {
        dummy = obj.prop;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
