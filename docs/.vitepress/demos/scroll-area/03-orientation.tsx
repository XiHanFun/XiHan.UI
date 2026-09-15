// 横向滚动 | 只启用横向滚动
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const cards = ["brand", "info", "success", "warning", "danger", "neutral"] as const;

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      orientation="horizontal"
      type="always"
      style={{ blockSize: "110px", inlineSize: "min(420px, 100%)", borderRadius: "var(--xh-shape-surface)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ display: "flex", gap: "10px", padding: "10px 12px" }}>
          {cards.map(tone => (
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
  );
}
