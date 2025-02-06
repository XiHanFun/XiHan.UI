/**
 * 数字格式化工具
 */
export const numberUtils = {
  /**
   * 格式化数字（添加千分位）
   */
  format(num: number, options: { decimals?: number; separator?: string } = {}): string {
    const { decimals = 0, separator = "," } = options;
    return Number(num)
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  },

  /**
   * 格式化文件大小
   */
  formatSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
  },

  /**
   * 格式化百分比
   */
  formatPercent(num: number, decimals = 2): string {
    return `${(num * 100).toFixed(decimals)}%`;
  },

  /**
   * 格式化货币
   */
  formatCurrency(num: number, options: { currency?: string; locale?: string } = {}): string {
    const { currency = "CNY", locale = "zh-CN" } = options;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(num);
  },

  /**
   * 数字精度处理
   */
  round(num: number, decimals = 0): number {
    return Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
  },
};
