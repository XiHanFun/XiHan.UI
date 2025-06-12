/**
 * 国际化相关类型定义
 */

/**
 * 支持的语言列表
 */
export type Locale = "zh-CN" | "en-US";

/**
 * 深度部分类型
 * 允许部分实现某个接口
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  /**
   * 日期格式
   * @default 'yyyy-MM-dd'
   */
  format?: string;
  /**
   * 地区
   */
  locale?: Locale;
}

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  /**
   * 最小精度
   */
  minPrecision?: number;
  /**
   * 最大精度
   */
  maxPrecision?: number;
  /**
   * 千分位分隔符
   */
  thousandSeparator?: string;
  /**
   * 小数点
   */
  decimalSeparator?: string;
  /**
   * 地区
   */
  locale?: Locale;
}

/**
 * 语言文本定义
 */
export interface LocaleText {
  /**
   * 语言名称
   */
  name: string;
  /**
   * 语言代码
   */
  code: string;
  /**
   * 是否为RTL（从右到左）布局
   */
  isRTL?: boolean;
}
