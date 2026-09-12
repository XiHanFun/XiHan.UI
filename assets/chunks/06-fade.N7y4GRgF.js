const r=`// 边缘渐隐 | variant="fade" 让还滚得动的那一侧把内容淡出，滚到头即收；带宽跟着 size 走
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const rows = Array.from({ length: 18 }, (_, i) => \`第 \${i + 1} 行内容\`);

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      variant="fade"
      size="lg"
      style={{ blockSize: "180px", inlineSize: "100%", maxInlineSize: "320px" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "8px 12px" }}>
          {rows.map(row => (
            <p key={row} style={{ margin: 0, lineHeight: "28px" }}>
              {row}
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
