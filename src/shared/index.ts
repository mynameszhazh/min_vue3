export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const isOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
};
