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

const cards = ["概览", "分析", "报告", "成员", "设置", "发布"];

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      orientation="horizontal"
      type="always"
      style={{ blockSize: "110px", inlineSize: "min(420px, 100%)", borderRadius: "var(--xh-shape-surface)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ display: "flex", gap: "10px", padding: "10px 12px" }}>
          {cards.map(card => (
            <div
              key={card}
              style={{
                flex: "none",
                display: "grid",
                placeItems: "center",
                inlineSize: "96px",
                blockSize: "64px",
                borderRadius: "var(--xh-shape-surface)",
                background: "var(--xh-bg-subtle)",
              }}
            >
              {card}
            </div>
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
