// 标签页组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface TabsLocale {
  loading: string;
  noData: string;
  noResult: string;
  add: string;
  remove: string;
  more: string;
}

export const TabsLocale: Record<string, DeepPartial<TabsLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    add: "新增",
    remove: "删除",
    more: "更多",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    add: "Add",
    remove: "Remove",
    more: "More",
  },
};
