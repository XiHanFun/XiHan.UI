// 数组操作相关

/**
 * 数组去重
 *
 * @param arr 需要去重的数组
 * @returns 去重后的新数组
 */
export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

/**
 * 数组扁平化
 *
 * @param arr 需要扁平化的数组
 * @param depth 扁平化深度，默认为Infinity
 * @returns 扁平化后的新数组
 */
export const flatten = <T>(arr: any[], depth = Infinity): T[] => {
  return arr.flat(depth);
};

/**
 * 数组分组
 *
 * @param arr 需要分组的数组
 * @param key 分组依据的键
 * @returns 分组后的对象
 */
export const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce((groups, item) => {
    const val = String(item[key]);
    groups[val] = groups[val] || [];
    groups[val].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * 数组排序
 *
 * @param arr 需要排序的数组
 * @param key 排序依据的键
 * @param order 排序方式，'asc'升序，'desc'降序
 * @returns 排序后的新数组
 */
export const sortBy = <T extends Record<string, any>>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] => {
  return [...arr].sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};
