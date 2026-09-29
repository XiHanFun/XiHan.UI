const n=`// 命令式滚动与到底通知 | scrollTo 滚动视口，reach-end 在滚到底那一下通知一次，常用来提示或续载
import type { ReactNode } from "react";
import {
  XhButton,
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const rows = Array.from({ length: 20 }, (_, i) => \`第 \${i + 1} 条记录\`);

export default function Demo(): ReactNode {
  const [status, setStatus] = useState("往下滚到底看看");

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start", inlineSize: "min(360px, 100%)" }}>
      <XhScrollAreaRoot
        type="always"
        aria-label="记录列表"
        style={{ blockSize: 180, inlineSize: "100%", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
        onReachEnd={(details) => {
          if (details.orientation === "vertical")
            setStatus("已经到底了");
        }}
      >
        {({ scrollTo }) => (
          <>
            <XhScrollAreaViewport>
              <XhScrollAreaContent style={{ padding: "8px 16px" }}>
                {rows.map(row => <p key={row} style={{ margin: "8px 0" }}>{row}</p>)}
              </XhScrollAreaContent>
            </XhScrollAreaViewport>
            <XhScrollAreaScrollbar orientation="vertical">
              <XhScrollAreaTrack>
                <XhScrollAreaThumb />
              </XhScrollAreaTrack>
            </XhScrollAreaScrollbar>
            <div style={{ position: "absolute", insetBlockEnd: 8, insetInlineEnd: 20 }}>
              <XhButton
                size="sm"
                variant="outline"
                onClick={() => {
                  scrollTo({ top: 0, behavior: "smooth" });
                  setStatus("往下滚到底看看");
                }}
              >
                回到顶部
              </XhButton>
            </div>
          </>
        )}
      </XhScrollAreaRoot>
      <span aria-live="polite">{status}</span>
    </div>
  );
}
`;export{n as default};
