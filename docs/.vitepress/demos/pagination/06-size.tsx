// 尺寸 | 适配不同的界面密度
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "中" },
  { value: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(720px, 100%)", display: "grid", gap: "16px" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "40px", flex: "none", color: "var(--xh-fg-muted)" }}>{s.label}</span>
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
