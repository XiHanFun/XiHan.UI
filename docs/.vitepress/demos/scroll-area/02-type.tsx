// 显隐时机 | type 决定滚动条什么时候露面：缺省的 scroll-hover 滚动或指针进来都露，hover 只认指针，always 恒露占一条道
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const types = ["scroll-hover", "hover", "always", "scroll"] as const;
const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行`);

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {types.map(type => (
        <div key={type} style={{ display: "grid", gap: "6px" }}>
          <span>{`type = ${type}`}</span>
          <XhScrollAreaRoot type={type} style={{ blockSize: "140px", inlineSize: "180px" }}>
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
