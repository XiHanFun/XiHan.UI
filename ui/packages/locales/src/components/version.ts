// 版本组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface VersionLocale {
  loading: string;
  noData: string;
  noResult: string;
  current: string;
  latest: string;
  update: string;
  checking: string;
  check: string;
  error: string;
}

export const VersionLocale: Record<string, DeepPartial<VersionLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    current: "当前版本",
    latest: "最新版本",
    update: "更新",
    checking: "检查中",
    check: "检查更新",
    error: "检查失败",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    current: "Current version",
    latest: "Latest version",
    update: "Update",
    checking: "Checking",
    check: "Check for updates",
    error: "Check failed",
  },
};
