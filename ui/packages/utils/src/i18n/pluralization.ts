/**
 * 复数形式处理工具
 */

/**
 * 复数规则函数类型
 * 根据数量返回对应的复数规则索引
 */
export type PluralRuleFunction = (n: number) => number;

/**
 * 复数规则配置
 */
export interface PluralRuleConfig {
  /**
   * 规则函数
   */
  rule: PluralRuleFunction;

  /**
   * 复数形式数量
   */
  count: number;

  /**
   * 示例
   */
  examples: { [key: number]: number[] };

  /**
   * 支持的语言
   */
  supportedLocales: string[];
}

/**
 * 复数形式
 * 不同语言复数规则不同，如：
 * - 英语: 单数、复数 (one, other)
 * - 中文: 无复数变化 (other)
 * - 俄语: 三种形式 (one, few, many, other)
 * - 阿拉伯语: 六种形式 (zero, one, two, few, many, other)
 */
export type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * 复数形式索引
 * 对应不同语言的复数规则返回的索引
 */
export const PLURAL_FORM_INDICES: Record<PluralForm, number> = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5,
};

/**
 * 各语言复数规则定义
 * 基于CLDR (Common Locale Data Repository) 规则
 */
export const PLURAL_RULES: Record<string, PluralRuleConfig> = {
  /**
   * 中文、日语、韩语等 - 无复数变化
   */
  chinese: {
    rule: () => PLURAL_FORM_INDICES.other,
    count: 1,
    examples: {
      5: [0, 1, 2, 3, 4, 5],
    },
    supportedLocales: ["zh", "ja", "ko", "vi", "th", "id", "ms"],
  },

  /**
   * 英语、德语、荷兰语等 - 单复数
   */
  english: {
    rule: (n: number) => {
      if (n === 1) return PLURAL_FORM_INDICES.one;
      return PLURAL_FORM_INDICES.other;
    },
    count: 2,
    examples: {
      1: [1],
      5: [0, 2, 3, 4, 5],
    },
    supportedLocales: ["en", "de", "nl", "es", "it", "pt", "sv", "da", "fi", "el", "hu"],
  },

  /**
   * 法语、葡萄牙语(巴西)等 - 0和1作为单数，其他为复数
   */
  french: {
    rule: (n: number) => {
      if (n === 0 || n === 1) return PLURAL_FORM_INDICES.one;
      return PLURAL_FORM_INDICES.other;
    },
    count: 2,
    examples: {
      1: [0, 1],
      5: [2, 3, 4, 5],
    },
    supportedLocales: ["fr", "pt-BR"],
  },

  /**
   * 俄语、波兰语等 - 复杂规则，四种形式
   */
  russian: {
    rule: (n: number) => {
      if (n % 10 === 1 && n % 100 !== 11) return PLURAL_FORM_INDICES.one;
      if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return PLURAL_FORM_INDICES.few;
      if (n % 10 === 0 || [5, 6, 7, 8, 9].includes(n % 10) || [11, 12, 13, 14].includes(n % 100))
        return PLURAL_FORM_INDICES.many;
      return PLURAL_FORM_INDICES.other;
    },
    count: 4,
    examples: {
      1: [1, 21, 31, 41, 51, 61],
      3: [2, 3, 4, 22, 23, 24],
      4: [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 25, 26, 27, 28, 29, 30],
    },
    supportedLocales: ["ru", "uk", "be", "hr", "sr", "bs", "sk", "cs", "pl"],
  },

  /**
   * 阿拉伯语 - 六种形式
   */
  arabic: {
    rule: (n: number) => {
      if (n === 0) return PLURAL_FORM_INDICES.zero;
      if (n === 1) return PLURAL_FORM_INDICES.one;
      if (n === 2) return PLURAL_FORM_INDICES.two;
      if (n % 100 >= 3 && n % 100 <= 10) return PLURAL_FORM_INDICES.few;
      if (n % 100 >= 11 && n % 100 <= 99) return PLURAL_FORM_INDICES.many;
      return PLURAL_FORM_INDICES.other;
    },
    count: 6,
    examples: {
      0: [0],
      1: [1],
      2: [2],
      3: [3, 4, 5, 6, 7, 8, 9, 10],
      4: [11, 12, 13, 14, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    },
    supportedLocales: ["ar"],
  },

  /**
   * 立陶宛语 - 三种形式，特殊规则
   */
  lithuanian: {
    rule: (n: number) => {
      if (n % 10 === 1 && n % 100 !== 11) return PLURAL_FORM_INDICES.one;
      if (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19)) return PLURAL_FORM_INDICES.few;
      return PLURAL_FORM_INDICES.other;
    },
    count: 3,
    examples: {
      1: [1, 21, 31, 41, 51, 61, 71, 81, 91],
      3: [2, 3, 4, 5, 6, 7, 8, 9, 22, 23, 24, 25, 26, 27, 28, 29],
    },
    supportedLocales: ["lt"],
  },

  /**
   * 捷克语、斯洛伐克语 - 三种形式
   */
  czech: {
    rule: (n: number) => {
      if (n === 1) return PLURAL_FORM_INDICES.one;
      if (n >= 2 && n <= 4) return PLURAL_FORM_INDICES.few;
      return PLURAL_FORM_INDICES.other;
    },
    count: 3,
    examples: {
      1: [1],
      3: [2, 3, 4],
      5: [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    supportedLocales: ["cs", "sk"],
  },
};

/**
 * 根据区域获取对应的复数规则
 * @param locale 区域代码
 * @returns 复数规则配置
 */
export function getPluralRule(locale: string): PluralRuleConfig {
  // 提取基本语言代码
  const baseLocale = locale.split("-")[0].toLowerCase();

  // 查找匹配的规则
  for (const ruleSet of Object.values(PLURAL_RULES)) {
    if (ruleSet.supportedLocales.includes(baseLocale) || ruleSet.supportedLocales.includes(locale)) {
      return ruleSet;
    }
  }

  // 默认返回中文规则（无复数变化）
  return PLURAL_RULES.chinese;
}

/**
 * 根据数量获取对应的复数形式
 * @param n 数量
 * @param locale 区域代码
 * @returns 复数形式索引
 */
export function getPluralFormIndex(n: number, locale: string = "zh-CN"): number {
  const rule = getPluralRule(locale);
  return rule.rule(n);
}

/**
 * 获取复数形式名称
 * @param index 复数形式索引
 * @returns 复数形式名称
 */
export function getPluralFormName(index: number): PluralForm {
  const forms: PluralForm[] = ["zero", "one", "two", "few", "many", "other"];
  return forms[index] || "other";
}

/**
 * 根据复数规则选择相应的信息
 * @param count 数量
 * @param forms 不同复数形式的信息
 * @param locale 区域代码
 * @returns 选择的信息
 */
export function selectPluralForm<T>(count: number, forms: T[], locale: string = "zh-CN"): T {
  const index = getPluralFormIndex(count, locale);

  // 如果没有对应索引的形式，使用 'other' 形式
  if (index >= forms.length) {
    return forms[forms.length - 1];
  }

  return forms[index];
}

/**
 * 格式化复数信息
 * @param count 数量
 * @param templates 模板字符串（对应不同复数形式）
 * @param locale 区域代码
 * @returns 格式化后的字符串
 */
export function formatPlural(count: number, templates: string[], locale: string = "zh-CN"): string {
  const template = selectPluralForm(count, templates, locale);
  return template.replace(/\{count\}/g, count.toString());
}

/**
 * 创建复数形式翻译函数
 * @param translations 翻译表
 * @returns 翻译函数
 */
export function createPluralTranslator(
  translations: Record<string, string[]>,
): (key: string, count: number, locale?: string) => string {
  return (key: string, count: number, locale: string = "zh-CN") => {
    const templates = translations[key];
    if (!templates) {
      return `${key}.${count}`;
    }

    return formatPlural(count, templates, locale);
  };
}

// 同时提供命名空间对象
export const pluralization = {
  getPluralRule,
  getPluralFormIndex,
  getPluralFormName,
  selectPluralForm,
  formatPlural,
  createPluralTranslator,
};

// 默认导出命名空间对象
export default pluralization;
