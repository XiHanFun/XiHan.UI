// 统计数值组件国际化
import type { DeepPartial } from "../types";

export interface StatisticLocale {
  loading: string;
  noData: string;
  noResult: string;
  precision: string;
  decimal: string;
  groupSeparator: string;
  prefix: string;
  suffix: string;
}

export const StatisticLocale: Record<string, DeepPartial<StatisticLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    precision: "精度",
    decimal: "小数点",
    groupSeparator: "千分位分隔符",
    prefix: "前缀",
    suffix: "后缀",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    precision: "Precision",
    decimal: "Decimal",
    groupSeparator: "Group Separator",
    prefix: "Prefix",
    suffix: "Suffix",
  },
};
