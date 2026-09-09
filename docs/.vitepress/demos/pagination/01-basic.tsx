// 基础用法 | count 给的是总条数不是总页数；页码序列由 root 的插槽交出来，作者照着渲染 item 与省略号
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
    <XhPaginationRoot count={196} pageSize={10} style={{ inlineSize: "100%" }}>
      {({ pages, page, totalPages }) => (
        <>
          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`} />
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
          <span style={{ flexBasis: "100%" }}>{`第 ${page} / ${totalPages} 页`}</span>
        </>
      )}
    </XhPaginationRoot>
  );
}
