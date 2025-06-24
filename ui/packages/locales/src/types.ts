/**
 * 国际化相关类型定义
 */

/**
 * 支持的语言列表
 */
export type Locale = "zh-CN" | "en-US";

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
