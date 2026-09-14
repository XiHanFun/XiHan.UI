// 展开省略位 | 查看被折叠的页码
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
    >
      {({ pageItems }) => (
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
        </>
      )}
    </XhPaginationRoot>
  );
}
