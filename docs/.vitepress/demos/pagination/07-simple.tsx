// 简洁模式 | 只显示上一页、当前页与下一页
import type { ReactNode } from "react";
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [page, setPage] = useState(2);

  return (
    <XhPaginationRoot
      page={page}
      onPageChange={details => setPage(details.page)}
      count={1000}
      pageSize={10}
    >
      {({ page: current, totalPages }) => (
        <>
          <XhPaginationPrevTrigger />
          <span>{`${current} / ${totalPages}`}</span>
          <XhPaginationNextTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
