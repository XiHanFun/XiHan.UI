// 基础用法 | 创建纵向滚动区域
import type { CSSProperties, ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const items = [
  { id: 1, tone: "brand", width: "76%" },
  { id: 2, tone: "info", width: "58%" },
  { id: 3, tone: "success", width: "84%" },
  { id: 4, tone: "warning", width: "66%" },
  { id: 5, tone: "danger", width: "72%" },
  { id: 6, tone: "neutral", width: "54%" },
  { id: 7, tone: "brand", width: "80%" },
  { id: 8, tone: "info", width: "62%" },
  { id: 9, tone: "success", width: "74%" },
  { id: 10, tone: "warning", width: "56%" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot type="always" aria-label="纵向滚动占位区块" style={{ blockSize: "180px", inlineSize: "min(360px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {items.map(item => (
            <span
              key={item.id}
              data-demo-block="line"
              data-tone={item.tone}
              style={{ "--xh-demo-block-inline-size": item.width, "marginBlock": "14px" } as CSSProperties}
            />
          ))}
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
    </XhScrollAreaRoot>
  );
}
