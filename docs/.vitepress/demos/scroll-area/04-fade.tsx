// 边缘渐隐 | 提示还有更多内容
import type { CSSProperties, ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length], width: `${56 + (index % 4) * 8}%` }));

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      variant="fade"
      size="lg"
      style={{ blockSize: "180px", inlineSize: "min(320px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {rows.map(row => (
            <span key={row.id} data-demo-block="line" data-tone={row.tone} style={{ "--xh-demo-block-inline-size": row.width, "marginBlock": "15px" } as CSSProperties} />
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
