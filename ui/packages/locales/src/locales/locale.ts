import { computed, ref } from "vue";
import type { Locale } from "../types";
import { zhCN } from "../lang/zh-CN";
import { enUS } from "../lang/en-US";

/**
 * 支持的语言包
 */
export const locales = {
  "zh-CN": zhCN,
  "en-US": enUS,
} as const;

/**
 * 当前语言
 */
export const currentLocale = ref<Locale>("zh-CN");

/**
 * 当前语言包
 */
export const locale = computed(() => locales[currentLocale.value]);

/**
 * 获取语言包
 * @param locale 语言代码
 */
export function getLocale(locale: Locale) {
  return locales[locale];
}

/**
 * 获取支持的所有语言列表
 */
export function getSupportedLocales() {
  return Object.keys(locales) as Locale[];
}

/**
 * 切换语言
 * @param lang 语言代码
 * @returns 是否切换成功
 */
export function changeLocale(lang: Locale): boolean {
  if (getSupportedLocales().includes(lang)) {
    currentLocale.value = lang;
    return true;
  }
  return false;
}

/**
 * 合并语言包
 * @param locales 要合并的语言包
 */
export function mergeLocales(locales: Record<string, any>, newLocales: Record<string, any>) {
  Object.keys(newLocales).forEach(locale => {
    if (locale in locales) {
      (locales as any)[locale] = deepMerge((locales as any)[locale], newLocales[locale]);
    } else {
      (locales as any)[locale] = newLocales[locale];
    }
  });
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      targetValue !== null &&
      typeof targetValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });

  return result;
}
