// 双轴滚动 | 同时显示横向和纵向滚动条
import type { CSSProperties, ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length] }));

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      type="always"
      aria-label="双轴滚动占位区块"
      style={{ blockSize: "160px", inlineSize: "min(420px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {rows.map(row => (
            <span
              key={row.id}
              data-demo-block="line"
              data-tone={row.tone}
              style={{ "--xh-demo-block-inline-size": "560px", "marginBlock": "14px" } as CSSProperties}
            />
          ))}
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
        <XhScrollAreaCorner />
      </XhScrollAreaScrollbar>
      <XhScrollAreaScrollbar orientation="horizontal">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
    </XhScrollAreaRoot>
  );
}
