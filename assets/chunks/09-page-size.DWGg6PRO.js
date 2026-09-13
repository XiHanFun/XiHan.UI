const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 每页条数 | 调整每页展示数量
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPaginationSummary,
} from "@xihan-ui/react";

const translations = {
  pageSizeOption: (size: number) => \`\${size} 条 / 页\`,
  summary: (start: number, end: number, total: number) => \`第 \${start}-\${end} 条，共 \${total} 条\`,
};

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot
      count={196}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50]}
      defaultPage={8}
      translations={translations}
    >
      {({ pages }) => (
        <>
          <XhPaginationSummary />
          <XhPaginationPageSizeSelect />

          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={\`\${p}-\${i}\`} />
            : <XhPaginationItem key={\`\${p}-\${i}\`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
        </>
      )}
    </XhPaginationRoot>
  );
}
`;export{n as default};
