// 受控与切片 | 传了 page 就由宿主说了算；当前页决定从整份数据里切出哪一段
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const rows = Array.from({ length: 23 }, (_, i) => `第 ${i + 1} 条记录`);

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);

  return (
    <XhPaginationRoot
      page={page}
      onPageChange={details => setPage(details.page)}
      count={rows.length}
      pageSize={5}
      style={{ inlineSize: "100%" }}
    >
      {({ pages, pageRange, count, slice }) => (
        <>
          <ul style={{ flexBasis: "100%", margin: "0 0 4px", paddingInlineStart: "20px" }}>
            {slice(rows).map(row => <li key={row}>{row}</li>)}
          </ul>

          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`} />
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
          <span style={{ flexBasis: "100%" }}>
            {`第 ${pageRange.start}-${pageRange.end} 条，共 ${count} 条`}
          </span>
        </>
      )}
    </XhPaginationRoot>
  );
}
