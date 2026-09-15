const n=`// 快速跳页 | 输入页码后按 Enter 跳转
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPaginationRoot count={1000} pageSize={10} defaultPage={5}>
      {({ pages }) => (
        <>
          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={\`\${p}-\${i}\`} />
            : <XhPaginationItem key={\`\${p}-\${i}\`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />
          <XhPaginationJumper placeholder="页码" />
        </>
      )}
    </XhPaginationRoot>
  );
}
`;export{n as default};
