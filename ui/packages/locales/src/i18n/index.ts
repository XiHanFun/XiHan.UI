import { useLocale } from "../locales/useLocale";
import type { Locale } from "../types";
import { mergeLocales } from "../locales/locale";

/**
 * i18n 适配器
 * 提供与 vue-i18n 和 react-i18next 类似的 API
 */
export const i18n = {
  /**
   * 获取当前语言
   */
  locale: useLocale().locale,

  /**
   * 切换语言
   * @param locale 语言代码
   */
  setLocale(locale: Locale) {
    useLocale().changeLocale(locale);
  },

  /**
   * 获取文本
   * @param key 文本键值
   * @param args 替换参数
   */
  t(key: string, ...args: any[]) {
    return useLocale().t(key, ...args);
  },

  /**
   * 获取当前语言包
   */
  get messages() {
    return useLocale().messages;
  },

  /**
   * 合并语言包
   * @param messages 要合并的语言包
   */
  mergeLocaleMessage(locale: Locale, messages: Record<string, any>) {
    mergeLocales(useLocale().messages, { [locale]: messages });
  },
};

/**
 * 创建 i18n 实例
 * 提供与 vue-i18n 和 react-i18next 类似的 API
 */
export function createI18n(options: { locale?: Locale; messages?: Record<string, any> } = {}) {
  const { locale, messages } = options;
  const instance = useLocale();

  if (locale) {
    instance.changeLocale(locale);
  }

  if (messages) {
    mergeLocales(instance.messages, messages);
  }

  return {
    locale: instance.locale,
    messages: instance.messages,
    t: instance.t,
    setLocale: instance.changeLocale,
    mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => {
      mergeLocales(instance.messages, { [locale]: messages });
    },
  };
}
