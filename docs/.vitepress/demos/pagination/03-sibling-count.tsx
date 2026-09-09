// 两侧页数 | sibling-count 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot
      count={500}
      pageSize={10}
      defaultPage={12}
      siblingCount={2}
      style={{ inlineSize: "100%" }}
    >
      {({ pages }) => (
        <>
          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`} />
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
