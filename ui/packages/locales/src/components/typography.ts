// 排版组件国际化
import type { DeepPartial } from "../types";

export interface TypographyLocale {
  loading: string;
  noData: string;
  noResult: string;
  expand: string;
  collapse: string;
  edit: string;
  copy: string;
  copied: string;
  copyError: string;
  ellipsis: string;
}

export const TypographyLocale: Record<string, DeepPartial<TypographyLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    expand: "展开",
    collapse: "收起",
    edit: "编辑",
    copy: "复制",
    copied: "已复制",
    copyError: "复制失败",
    ellipsis: "省略",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    expand: "Expand",
    collapse: "Collapse",
    edit: "Edit",
    copy: "Copy",
    copied: "Copied",
    copyError: "Copy failed",
    ellipsis: "Ellipsis",
  },
};
