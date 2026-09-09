// 尺寸 | size 一档换掉页码格子的高度、内边距与字号，上一页 / 下一页与省略号一并跟着变
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "16px" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "60px", flex: "none" }}>{s.label}</span>
          <XhPaginationRoot count={200} pageSize={10} defaultPage={4} size={s.value}>
            {({ pages }) => (
              <>
                <XhPaginationPrevTrigger />
                {pages.map((p, i) => (p === "ellipsis"
                  ? <XhPaginationEllipsisTrigger key={`${p}-${i}`} />
                  : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
                <XhPaginationNextTrigger />
              </>
            )}
          </XhPaginationRoot>
        </div>
      ))}
    </div>
  );
}
