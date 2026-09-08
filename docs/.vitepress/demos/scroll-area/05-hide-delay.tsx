// 收起的等待 | type 为 scroll 时滚动条停手后不立刻收起，hideDelay 决定还留多少毫秒
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const cases = [
  { delay: 200, label: "200ms：停手就收" },
  { delay: 2000, label: "2000ms：停手后还留两秒" },
];
const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行`);

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {cases.map(item => (
        <div key={item.delay} style={{ display: "grid", gap: "6px" }}>
          <span>{item.label}</span>
          <XhScrollAreaRoot
            type="scroll"
            hideDelay={item.delay}
            style={{ blockSize: "140px", inlineSize: "200px" }}
          >
            <XhScrollAreaViewport>
              <XhScrollAreaContent style={{ padding: "8px 12px" }}>
                {lines.map(line => (
                  <p key={line} style={{ margin: 0, lineHeight: "22px" }}>
                    {line}
                  </p>
                ))}
              </XhScrollAreaContent>
            </XhScrollAreaViewport>
            <XhScrollAreaScrollbar orientation="vertical">
              <XhScrollAreaTrack>
                <XhScrollAreaThumb />
              </XhScrollAreaTrack>
            </XhScrollAreaScrollbar>
          </XhScrollAreaRoot>
        </div>
      ))}
    </div>
  );
}
