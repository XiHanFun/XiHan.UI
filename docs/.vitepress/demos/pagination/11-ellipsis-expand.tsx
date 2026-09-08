// 摊开省略号 | 折进去的那几页悬停即摊开，点一下也摊开——纯悬停会把键盘用户挡在外面，而这几页除了这里没有别的入口；Escape 或点外面收起
import type { ReactNode } from "react";
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPositioner,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot
      count={2000}
      pageSize={10}
      defaultPage={100}
      style={{ inlineSize: "100%" }}
    >
      {({ pageItems, page }) => (
        <>
          <XhPaginationPrevTrigger />
          {pageItems.map((item, i) => (item.type === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${item.type}-${i}`} side={item.side} />
            : <XhPaginationItem key={`${item.type}-${i}`} value={item.value}>{item.value}</XhPaginationItem>))}
          <XhPaginationNextTrigger />

          <XhPaginationPositioner>
            <XhPaginationContent>
              {({ pages }) => pages.map(p => (
                <XhPaginationItem key={p} value={p}>{p}</XhPaginationItem>
              ))}
            </XhPaginationContent>
          </XhPaginationPositioner>

          <span style={{ flexBasis: "100%" }}>{`当前第 ${page} 页，共 200 页`}</span>
        </>
      )}
    </XhPaginationRoot>
  );
}
