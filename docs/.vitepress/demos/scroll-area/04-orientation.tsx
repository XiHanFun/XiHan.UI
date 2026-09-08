// 只管一条轴 | orientation 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const cards = Array.from({ length: 12 }, (_, i) => `卡片 ${i + 1}`);

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      orientation="horizontal"
      type="always"
      style={{ blockSize: "110px", inlineSize: "100%", maxInlineSize: "420px" }}
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
                border: "1px solid var(--xh-border-subtle)",
                borderRadius: "8px",
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
