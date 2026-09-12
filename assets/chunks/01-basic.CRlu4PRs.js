const r=`// 基础用法 | root 要有确定高度，视口才量得出溢出；滚动走的是浏览器原生通路，组件只画滚动条
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const lines = Array.from({ length: 30 }, (_, i) => \`第 \${i + 1} 行内容\`);

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot style={{ blockSize: "180px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "8px 12px" }}>
          {lines.map(line => (
            <p key={line} style={{ margin: 0, lineHeight: "24px" }}>
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
  );
}
`;export{r as default};
