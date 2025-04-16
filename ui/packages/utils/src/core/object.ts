import { isObject } from "./types";

/**
 * 深度克隆一个对象
 * 深度克隆是指克隆的对象中的嵌套对象也会被克隆，而不是仅仅复制引用
 * 这对于需要完全独立于原始对象的新对象时非常有用
 * @param obj 需要克隆的对象
 * @returns 克隆后的对象，与原对象完全独立
 */
export function deepClone<T>(obj: T): T {
  if (!isObject(obj)) return obj;

  const clone: Record<string, any> = Array.isArray(obj) ? [] : {};

  Object.keys(obj as object).forEach(key => {
    clone[key] = deepClone((obj as Record<string, any>)[key]);
  });

  return clone as T;
}

/**
 * 合并两个对象
 * @param target 目标对象，用于存储合并后的结果
 * @param source 源对象，用于提供要合并的属性
 * @returns 合并后的目标对象
 */
export function merge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  Object.keys(source).forEach(key => {
    if (!(key in target)) {
      (target as Record<string, any>)[key] = source[key];
    }
  });

  return target;
}

/**
 * 获取对象的类型
 * @param obj 需要获取类型的对象
 * @returns 返回对象的类型
 */
export function getType(obj: any): string {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * 检查对象是否为空
 * @param obj 需要检查的对象
 * @returns 如果对象为空，则返回true，否则返回false
 */
export function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 深度合并
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的目标对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * 对象路径获取
 * @param obj 需要获取路径的对象
 * @param path 路径字符串或字符串数组
 * @param defaultValue 默认值
 * @returns 获取到的值或默认值
 */
export function get(obj: any, path: string | string[], defaultValue?: any): any {
  const pathStr = Array.isArray(path) ? path.join(".") : path;
  const travel = (regexp: RegExp) =>
    pathStr
      .split(regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * 对象路径设置
 * @param obj 需要设置路径的对象
 * @param path 路径字符串或字符串数组
 * @param value 要设置的值
 * @returns 设置后的对象
 */
export function set(obj: any, path: string | string[], value: any): any {
  if (Object(obj) !== obj) return obj;
  const keys = !Array.isArray(path) ? (path.toString().match(/[^.[\]]+/g) ?? []) : path;

  keys.slice(0, -1).reduce((a, c, i) => {
    if (Object(a[c]) === a[c]) {
      return a[c];
    } else {
      a[c] = Math.abs(Number(keys[i + 1])) >> 0 === +keys[i + 1] ? [] : {};
      return a[c];
    }
  }, obj)[keys[keys.length - 1]] = value;

  return obj;
}

/**
 * 对象扁平化
 * @param obj 需要扁平化的对象
 * @param prefix 前缀
 * @returns 扁平化后的对象
 */
export function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce(
    (acc, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (isObject(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}
