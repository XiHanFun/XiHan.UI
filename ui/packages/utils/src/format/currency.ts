/**
 * 货币格式化工具
 */
export const currencyFormatUtils = {
  /**
   * 格式化货币
   *
   * @param amount 金额
   * @param options 格式化选项
   * @returns 格式化后的货币字符串
   */
  format: (amount: number, options: { currency?: string; locale?: string } = {}) => {
    const { currency = "CNY", locale = "zh-CN" } = options;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  },
};
