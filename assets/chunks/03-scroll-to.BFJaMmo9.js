var e=`// 滚动到指定条目 | scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹取
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "32px",
  paddingInline: "12px",
  borderBlockEnd: "var(--xh-stroke-thin) solid var(--xh-border-subtle)",
};

export default function Demo(): ReactNode {
  // 可视区首条经 onRangeChange 报上来
  const [start, setStart] = useState<number | null>(null);

  return (
    <>
      {/* 操作入口从根部件的插槽里取，滚动的活儿交给内核 */}
      <XhVirtualizerRoot
        count={2000}
        estimateSize={32}
        style={{ inlineSize: "100%", maxInlineSize: "420px" }}
        onRangeChange={details => setStart(details.startIndex)}
      >
        {({ virtualItems, scrollToIndex }) => (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingBlockEnd: "8px" }}>
              <XhButton size="sm" variant="outline" onClick={() => scrollToIndex(0)}>回到第 1 条</XhButton>
              <XhButton size="sm" variant="outline" onClick={() => scrollToIndex(500, { align: "center" })}>
                第 501 条居中
              </XhButton>
              <XhButton size="sm" variant="outline" onClick={() => scrollToIndex(9999, { align: "end" })}>
                末条贴底
              </XhButton>
            </div>

            {/* 视口自带确定高度，root 就不必再定高 */}
            <XhVirtualizerViewport style={{ blockSize: "220px" }}>
              <XhVirtualizerContent>
                {virtualItems.map(item => (
                  <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                    {\`第 \${item.index + 1} 条\`}
                  </XhVirtualizerItem>
                ))}
              </XhVirtualizerContent>
            </XhVirtualizerViewport>
          </>
        )}
      </XhVirtualizerRoot>
      <span data-demo-output>{\`可视区首条：\${start ?? "—"}\`}</span>
    </>
  );
}
`;export{e as default};