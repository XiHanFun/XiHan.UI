// 滚动方向 | orientation 决定组件管理哪条轴：缺省 both 两个方向都能滚，两条滚动条交会处由 corner 补齐；horizontal 只启用横向滚动
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <XhScrollAreaRoot
        revealMode="always"
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

      <XhScrollAreaRoot
        orientation="horizontal"
        revealMode="always"
        style={{ blockSize: "110px", inlineSize: "min(420px, 100%)", borderRadius: "var(--xh-shape-surface)" }}
      >
        <XhScrollAreaViewport>
          <XhScrollAreaContent style={{ display: "flex", gap: "10px", padding: "10px 12px" }}>
            {tones.map(tone => (
              <div
                key={tone}
                data-demo-block
                data-tone={tone}
                style={{
                  flex: "none",
                  inlineSize: "96px",
                  blockSize: "64px",
                }}
              />
            ))}
          </XhScrollAreaContent>
        </XhScrollAreaViewport>
        <XhScrollAreaScrollbar orientation="horizontal">
          <XhScrollAreaTrack>
            <XhScrollAreaThumb />
          </XhScrollAreaTrack>
        </XhScrollAreaScrollbar>
      </XhScrollAreaRoot>
    </div>
  );
}
