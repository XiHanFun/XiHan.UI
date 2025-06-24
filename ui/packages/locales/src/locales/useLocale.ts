/**
 * 国际化Hook
 */
import { currentLocale, locale, changeLocale, mergeLocales } from "./locale";
import type { Locale } from "../types";

/**
 * 国际化文案获取Hook
 *
 * @example
 * ```typescript
 * const { t, locale, changeLocale } = useLocale();
 *
 * // 使用组件文案
 * t('button.confirm'); // "确认"
 *
 * // 使用全局文案
 * t('global.save'); // "保存"
 *
 * // 使用默认值
 * t('button.unknown', '默认按钮'); // "默认按钮"
 *
 * // 切换语言
 * changeLocale('en-US');
 * ```
 */
export function useLocale() {
  /**
   * 获取文本
   * @param key 文本键值，格式为"组件名.文本键"
   * @param args 替换参数
   * @returns 国际化文本
   */
  const t = (key: string, ...args: any[]): string => {
    const keys = key.split(".");
    let result: any = locale.value;

    // 逐层查找文本
    for (const k of keys) {
      if (!result || result[k] === undefined) {
        // 如果第一个参数是字符串且不是占位符格式，则作为默认值返回
        if (args.length > 0 && typeof args[0] === "string" && !args[0].includes("{")) {
          return args[0];
        }
        console.warn(`[XiHan UI] Cannot find locale text for key: ${key}`);
        return key;
      }
      result = result[k];
    }

    // 如果是函数，调用函数
    if (typeof result === "function") {
      return result(...args);
    }

    // 如果参数存在，替换文本中的占位符
    if (typeof result === "string" && args.length > 0) {
      return formatText(result, args);
    }

    // 返回结果
    return String(result);
  };

  /**
   * 将文本中的 {n} 替换为参数
   * @param text 文本模板
   * @param args 参数
   * @returns 替换后的文本
   */
  const formatText = (text: string, args: any[]): string => {
    if (!text || !args || !args.length) return text;

    return text.replace(/{(\d+)}/g, (match, number) => {
      const index = Number(number);
      return args[index] !== undefined ? String(args[index]) : match;
    });
  };

  return {
    // 当前语言
    locale: currentLocale,
    // 当前语言包
    messages: locale,
    // 文案获取函数
    t,
    // 语言切换函数
    changeLocale: (lang: Locale) => changeLocale(lang),
    // 格式化文本
    formatText,
    // 合并语言包
    mergeLocales,
  };
}
