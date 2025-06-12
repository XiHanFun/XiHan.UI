// 分页组件国际化
import type { DeepPartial } from "../types";

export interface PaginationLocale {
  total: string;
  items: string;
  item: string;
  page: string;
  perPage: string;
  jumpTo: string;
  prev: string;
  next: string;
  pageSize: string;
}

export const PaginationLocale: Record<string, DeepPartial<PaginationLocale>> = {
  "zh-CN": {
    total: "共",
    items: "条",
    item: "条",
    page: "页",
    perPage: "条/页",
    jumpTo: "跳至",
    prev: "上一页",
    next: "下一页",
    pageSize: "页码",
  },
  "en-US": {
    total: "Total",
    items: "items",
    item: "item",
    page: "page",
    perPage: "/page",
    jumpTo: "Go to",
    prev: "Previous",
    next: "Next",
    pageSize: "Page Size",
  },
};
