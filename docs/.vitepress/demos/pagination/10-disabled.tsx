// 整组禁用 | 分页自己没有禁用开关：裹一层 disabled 的 fieldset，里面的按钮统一失效并脱出 Tab 序
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

// 禁用期间把页码格子的取色也压成禁用态：上一页 / 下一页由皮肤的 :disabled 规则自己接管
const mutedTokens = {
  "--xh-pagination-item-fg": "var(--xh-fg-disabled)",
  "--xh-pagination-item-bg-hover": "transparent",
  "--xh-pagination-item-bg-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-border-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-fg-selected": "var(--xh-fg-disabled)",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton size="sm" variant="outline" onClick={() => setLoading(!loading)}>
          {loading ? "加载完成" : "重新加载"}
        </XhButton>
        <span>{loading ? "数据加载中，整组分页不可操作" : "可以翻页了"}</span>
      </div>

      <fieldset
        disabled={loading}
        style={{
          margin: 0,
          padding: 0,
          border: 0,
          minInlineSize: 0,
          ...(loading ? mutedTokens : {}),
        }}
      >
        <XhPaginationRoot count={196} pageSize={10} defaultPage={3}>
          {({ pages }) => (
            <>
              <XhPaginationPrevTrigger />
              {pages.map((p, i) => (p === "ellipsis"
                ? <XhPaginationEllipsisTrigger key={`${p}-${i}`}>…</XhPaginationEllipsisTrigger>
                : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
              <XhPaginationNextTrigger />
            </>
          )}
        </XhPaginationRoot>
      </fieldset>
    </div>
  );
}
