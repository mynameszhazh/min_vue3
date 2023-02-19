export const isString = (val) => typeof val === "string";

export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const isOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
};

export const capitalize = (str: string) => {
  return str[0].toLocaleUpperCase() + str.slice(1);
};

export const camelize = (str: string) => {
  // 选中所有 - 后面的第一个
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toLocaleUpperCase() : "";
  });
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
