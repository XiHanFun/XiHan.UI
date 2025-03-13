/**
 * 数组求和
 * @param arr 需要求和的数组
 * @returns 求和后的结果
 */
export const sum = (arr: number[]): number => arr.reduce((acc, curr) => acc + curr, 0);

/**
 * 数组求平均值
 * @param arr 需要求平均值的数组
 * @returns 求平均值后的结果
 */
export const average = (arr: number[]): number => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;

/**
 * 数组求最大值
 * @param arr 需要求最大值的数组
 * @returns 求最大值后的结果
 */
export const max = (arr: number[]): number => Math.max(...arr);

/**
 * 数组求最小值
 * @param arr 需要求最小值的数组
 * @returns 求最小值后的结果
 */
export const min = (arr: number[]): number => Math.min(...arr);

/**
 * 数组去重
 * @param arr 需要去重的数组
 * @returns 去重后的新数组
 */
export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

/**
 * 数组扁平化
 * @param arr 需要扁平化的数组
 * @param depth 扁平化深度，默认为Infinity
 * @returns 扁平化后的新数组
 */
export const flatten = <T>(arr: any[], depth = Infinity): T[] => arr.flat(depth);

/**
 * 数组过滤
 * @param arr 需要过滤的数组
 * @param callback 过滤条件
 * @returns 过滤后的新数组
 */
export const filter = <T>(arr: T[], callback: (item: T) => boolean): T[] => arr.filter(callback);

/**
 * 数组映射
 * @param arr 需要映射的数组
 * @param callback 映射条件
 * @returns 映射后的新数组
 */
export const map = <T, U>(arr: T[], callback: (item: T) => U): U[] => arr.map(callback);

/**
 * 数组分组
 * @param arr 需要分组的数组
 * @param key 分组依据的键
 * @returns 分组后的对象
 */
export const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> =>
  arr.reduce(
    (groups, item) => {
      const val = String(item[key]);
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );

/**
 * 数组排序
 * @param arr 需要排序的数组
 * @param key 排序依据的键
 * @param order 排序方式，'asc'升序，'desc'降序
 * @returns 排序后的新数组
 */
export const sortBy = <T extends Record<string, any>>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] =>
  [...arr].sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });

export const arrayUtils = {
  sum,
  average,
  max,
  min,
  unique,
  flatten,
  filter,
  map,
  groupBy,
  sortBy,
} as const;

export default arrayUtils;
