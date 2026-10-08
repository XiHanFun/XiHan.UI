var e=`// 分页 | 列表只画当前页的条目，末尾接分页：换页时换一段数据，条目与页码各管各的
import type { ReactNode } from "react";
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

// 23 张工单，每页 5 张
const STATUS = ["待处理", "处理中", "已解决"];
const tickets = Array.from({ length: 23 }, (_, i) => ({
  id: 1001 + i,
  title: \`工单 #\${1001 + i}\`,
  desc: \`\${STATUS[i % 3]} · 华东区\`,
}));
const PAGE_SIZE = 5;

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);
  const visible = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", maxInlineSize: "360px" }}>
      <XhListRoot split>
        {visible.map(t => (
          <XhListItem key={t.id}>
            <XhListItemContent>
              <XhListItemTitle>{t.title}</XhListItemTitle>
              <XhListItemDescription>{t.desc}</XhListItemDescription>
            </XhListItemContent>
          </XhListItem>
        ))}
      </XhListRoot>
      <XhPaginationRoot
        page={page}
        onPageChange={details => setPage(details.page)}
        count={tickets.length}
        pageSize={PAGE_SIZE}
      >
        {({ pages }) => (
          <>
            <XhPaginationPrevTrigger />
            {pages.map((p, i) => (p === "ellipsis"
              ? <XhPaginationEllipsisTrigger key={\`\${p}-\${i}\`} />
              : <XhPaginationItem key={\`\${p}-\${i}\`} value={p}>{p}</XhPaginationItem>))}
            <XhPaginationNextTrigger />
          </>
        )}
      </XhPaginationRoot>
    </div>
  );
}
`;export{e as default};