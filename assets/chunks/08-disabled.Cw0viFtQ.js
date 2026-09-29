const n=`// 整组禁用 | 数据加载期间整组不可操作，当前页仍标得出
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
    <XhPaginationRoot count={196} pageSize={10} defaultPage={3} disabled>
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
  );
}
`;export{n as default};
