var e=`// 基础用法 | 一万条只渲染可视区内的几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自行编写
import type { VirtualizerRangeChangeDetails } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "12px",
  borderBlockEnd: "var(--xh-stroke-thin) solid var(--xh-border-subtle)",
};

export default function Demo(): ReactNode {
  // 渲染区间经 onRangeChange 报上来，只在区间真的变了时才报
  const [range, setRange] = useState("—");

  function onRangeChange({ startIndex, endIndex }: VirtualizerRangeChangeDetails): void {
    setRange(startIndex == null ? "—" : \`\${startIndex} – \${endIndex}\`);
  }

  return (
    <>
      <XhVirtualizerRoot
        count={10000}
        estimateSize={36}
        style={{ blockSize: "260px", inlineSize: "100%", maxInlineSize: "420px" }}
        onRangeChange={onRangeChange}
      >
        {({ virtualItems }) => (
          <XhVirtualizerViewport>
            <XhVirtualizerContent>
              {virtualItems.map(item => (
                <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                  {\`第 \${item.index + 1} 条\`}
                </XhVirtualizerItem>
              ))}
            </XhVirtualizerContent>
          </XhVirtualizerViewport>
        )}
      </XhVirtualizerRoot>
      <span data-demo-output>{\`可视区：\${range}\`}</span>
    </>
  );
}
`;export{e as default};