// 读屏文案 | translations 换掉 nav 地标名与各按钮的 aria-label，默认是英文
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

const translations = {
  root: "订单列表分页",
  prevTrigger: "上一页",
  nextTrigger: "下一页",
  item: (page: number) => `第 ${page} 页`,
};

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot
      count={80}
      pageSize={10}
      translations={translations}
      style={{ inlineSize: "100%" }}
    >
      {({ pages }) => (
        <>
          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`}>…</XhPaginationEllipsisTrigger>
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
