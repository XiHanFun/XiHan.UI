// 挂状态点与角标 | 状态点自己绝对定位在根里；计数角标反过来——把头像写进角标的默认插槽，贴角与偏移都归角标算
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhBadge } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {/* 状态点落在圆内，裁剪不用动 */}
      <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
        <span
          role="img"
          aria-label="在线"
          style={{
            position: "absolute",
            insetBlockEnd: "2px",
            insetInlineEnd: "2px",
            inlineSize: "10px",
            blockSize: "10px",
            borderRadius: "var(--xh-shape-pill)",
            background: "var(--xh-fg-success)",
          }}
        />
      </XhAvatarRoot>

      {/* 计数角标：被标记的头像写进默认插槽，贴哪个角、偏多少都归角标 */}
      <XhBadge count={12} tone="danger" size="sm" label="12 条未读">
        <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>

      {/* 落回退态时一样成立；点描一圈底色，压在头像边上也分得开 */}
      <XhAvatarRoot size="lg" style={{ overflow: "visible" }}>
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
        <span
          role="img"
          aria-label="离线"
          style={{
            position: "absolute",
            insetBlockEnd: "0",
            insetInlineEnd: "0",
            inlineSize: "12px",
            blockSize: "12px",
            border: "2px solid var(--vp-c-bg)",
            borderRadius: "var(--xh-shape-pill)",
            background: "var(--xh-fg-disabled)",
          }}
        />
      </XhAvatarRoot>
    </div>
  );
}
