const n=`// 极简排布 | 页码序列不渲染也行，只留上一页 / 下一页与一行位置回显；先后顺序归作者
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
      style={{ inlineSize: "100%" }}
    >
      {({ page: current, totalPages }) => (
        <>
          <XhPaginationPrevTrigger />
          <span>{\`\${current} / \${totalPages}\`}</span>
          <XhPaginationNextTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
`;export{n as default};
