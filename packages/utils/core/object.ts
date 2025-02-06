import { isObject } from "./types";

// 对象操作相关

/**
 * 深度克隆一个对象
 * 深度克隆是指克隆的对象中的嵌套对象也会被克隆，而不是仅仅复制引用
 * 这对于需要完全独立于原始对象的新对象时非常有用
 *
 * @param obj 需要克隆的对象
 * @returns 克隆后的对象，与原对象完全独立
 */
export const deepClone = <T>(obj: T): T => {
  if (!isObject(obj)) return obj;

  const clone: Record<string, any> = Array.isArray(obj) ? [] : {};

  Object.keys(obj as object).forEach(key => {
    clone[key] = deepClone((obj as Record<string, any>)[key]);
  });

  return clone as T;
};

/**
 * 合并两个对象
 *
 * @param target 目标对象，用于存储合并后的结果
 * @param source 源对象，用于提供要合并的属性
 * @returns 合并后的目标对象
 */
export const merge = <T extends Record<string, any>>(target: T, source: Record<string, any>): T => {
  Object.keys(source).forEach(key => {
    if (!(key in target)) {
      (target as Record<string, any>)[key] = source[key];
    }
  });

  return target;
};

/**
 * 获取对象的类型
 *
 * @param obj 需要获取类型的对象
 * @returns 返回对象的类型
 */
export const getType = (obj: any): string => {
  return Object.prototype.toString.call(obj).slice(8, -1);
};

/**
 * 检查对象是否为空
 *
 * @param obj 需要检查的对象
 * @returns 如果对象为空，则返回true，否则返回false
 */
export const isEmpty = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};
