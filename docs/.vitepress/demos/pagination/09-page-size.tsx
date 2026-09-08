// 每页条数 | 控制器由库自带：档位从 page-size-options 来，换档时页码跟着换算，改档前第一条仍留在页内
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot
      count={196}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50]}
      defaultPage={8}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", inlineSize: "100%" }}
    >
      {({ pages, pageRange, count, page }) => (
        <>
          <XhPaginationPageSizeSelect>
            {({ options }) => options.map(o => (
              <option key={o} value={String(o)}>{`${o} 条 / 页`}</option>
            ))}
          </XhPaginationPageSizeSelect>

          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`} />
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />

          <span style={{ flexBasis: "100%" }}>
            {`第 ${page} 页 · 第 ${pageRange.start}-${pageRange.end} 条，共 ${count} 条`}
          </span>
        </>
      )}
    </XhPaginationRoot>
  );
}
