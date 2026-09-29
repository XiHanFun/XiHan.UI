const n=`// 首页与末页 | 页数很多时一步跳到头
import type { ReactNode } from "react";
import {
  XhPaginationFirstTrigger,
  XhPaginationLastTrigger,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [page, setPage] = useState(37);

  return (
    <XhPaginationRoot
      page={page}
      onPageChange={details => setPage(details.page)}
      count={1000}
      pageSize={10}
    >
      {({ page: current, totalPages }) => (
        <>
          <XhPaginationFirstTrigger />
          <XhPaginationPrevTrigger />
          <span>{\`\${current} / \${totalPages}\`}</span>
          <XhPaginationNextTrigger />
          <XhPaginationLastTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
`;export{n as default};
