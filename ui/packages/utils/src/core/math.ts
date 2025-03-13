/**
 * 精确加法
 * @param num1 需要加的数
 * @param num2 被加的数
 * @returns 精确加法后的结果
 */
export const add = (num1: number, num2: number): number => {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
};

/**
 * 精确减法
 * @param num1 需要减去的数
 * @param num2 被减去的数
 * @returns 精确减法后的结果
 */
export const subtract = (num1: number, num2: number): number => {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum - num2 * baseNum) / baseNum;
};

/**
 * 计算百分比
 * @param num 需要计算的数
 * @param total 总数
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export const percentage = (num: number, total: number, decimals = 2): string => {
  return `${((num / total) * 100).toFixed(decimals)}%`;
};

/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * 数值范围限制
 * @param num 需要限制的数
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};
