import { camelize, toHandlerKey } from "@xjh-mini-vue/shared";

export function emit(instance, event, ...args) {
  console.log("componentEmit", event);

  const { props } = instance;

  // TPP
  // 先去写一个特定的行为 -> 重构成通用的行为
  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
