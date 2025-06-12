// 空状态组件国际化
import type { DeepPartial } from "../types";

export interface EmptyLocale {
  description: string;
  noData: string;
  noResult: string;
  noMatch: string;
  noPermission: string;
  noNetwork: string;
  noConnection: string;
}

export const EmptyLocale: Record<string, DeepPartial<EmptyLocale>> = {
  "zh-CN": {
    description: "暂无数据",
    noData: "暂无数据",
    noResult: "无匹配结果",
    noMatch: "无匹配项",
    noPermission: "暂无权限",
    noNetwork: "网络异常",
    noConnection: "连接失败",
  },
  "en-US": {
    description: "No Data",
    noData: "No Data",
    noResult: "No Results",
    noMatch: "No Matches",
    noPermission: "No Permission",
    noNetwork: "Network Error",
    noConnection: "Connection Failed",
  },
};
