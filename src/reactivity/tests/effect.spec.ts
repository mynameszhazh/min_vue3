import { effect } from "../effect";
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
    let num 
    let runner = effect(() => {
      num = ob.foo + 1
      return 'foo'
    })

    expect(num).toBe(124)
    expect(runner()).toBe('foo')
  });
});
