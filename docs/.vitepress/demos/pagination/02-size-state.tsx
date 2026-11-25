// 尺寸与状态 | size 适配不同的界面密度；disabled 让数据加载期间整组不可操作，当前页仍标得出
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
    <div style={{ inlineSize: "min(720px, 100%)", display: "grid", gap: "var(--xh-space-4)" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
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

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        <span style={{ inlineSize: "40px", flex: "none", color: "var(--xh-fg-muted)" }}>禁用</span>
        <XhPaginationRoot count={196} pageSize={10} defaultPage={3} disabled>
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
    </div>
  );
}
