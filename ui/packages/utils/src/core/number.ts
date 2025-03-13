/**
 * 将数字添加千位分隔符
 * @param num 需要添加千位分隔符的数字
 * @returns 返回添加千位分隔符后的字符串
 */
export const thousandsSeparator = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 将数字四舍五入到指定精度
 * @param num 需要四舍五入的数字
 * @param precision 可选参数，表示保留的小数位数，默认为0
 * @returns 返回四舍五入后的数字
 */
export const round = (num: number, precision = 0): number => {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};

export const numberUtils = {
  thousandsSeparator,
  round,
} as const;

export default numberUtils;
