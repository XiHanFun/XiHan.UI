/**
 * 模拟数据生成工具
 * 提供各种类型的模拟数据生成方法
 */

import type { MockOptions, MockDataConfig } from "./types";

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @param type 字符串类型
 * @returns 随机字符串
 */
export function mockString(length: number = 10, type: "alpha" | "numeric" | "alphanumeric" = "alphanumeric"): string {
  const chars = {
    alpha: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numeric: "0123456789",
    alphanumeric: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  };

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[type].charAt(Math.floor(Math.random() * chars[type].length));
  }
  return result;
}

/**
 * 生成随机数字
 * @param min 最小值
 * @param max 最大值
 * @param decimal 小数位数
 * @returns 随机数字
 */
export function mockNumber(min: number = 0, max: number = 100, decimal: number = 0): number {
  const num = Math.random() * (max - min) + min;
  return decimal ? Number(num.toFixed(decimal)) : Math.floor(num);
}

/**
 * 生成随机布尔值
 * @param probability 为true的概率(0-1)
 * @returns 随机布尔值
 */
export function mockBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * 生成随机日期
 * @param start 开始日期
 * @param end 结束日期
 * @returns 随机日期
 */
export function mockDate(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 生成随机数组
 * @param length 数组长度
 * @param generator 元素生成器
 * @returns 随机数组
 */
export function mockArray<T>(length: number, generator: () => T): T[] {
  return Array.from({ length }, generator);
}

/**
 * 生成随机对象
 * @param config 对象配置
 * @returns 随机对象
 */
export function mockObject<T extends Record<string, any>>(config: MockDataConfig<T>): T {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "function") {
      result[key] = value();
    } else if (Array.isArray(value)) {
      result[key] = mockArray(value[0], value[1]);
    } else if (typeof value === "object" && value !== null) {
      result[key] = mockObject(value as MockDataConfig<any>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * 生成模拟API响应
 * @param data 响应数据
 * @param options 响应选项
 * @returns 模拟响应
 */
export function mockResponse<T>(data: T, options: { status?: number; delay?: number } = {}): Promise<{ data: T }> {
  const { status = 200, delay = 500 } = options;

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
}

/**
 * 生成模拟错误响应
 * @param message 错误信息
 * @param options 错误选项
 * @returns 模拟错误
 */
export function mockError(message: string, options: { status?: number; delay?: number } = {}): Promise<never> {
  const { status = 500, delay = 500 } = options;

  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, delay);
  });
}

export default {
  mockString,
  mockNumber,
  mockBoolean,
  mockDate,
  mockArray,
  mockObject,
  mockFaker,
  mockResponse,
  mockError,
};
