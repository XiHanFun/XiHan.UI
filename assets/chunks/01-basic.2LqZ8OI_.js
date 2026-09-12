const e=`// 基础用法 | 一万条只渲可视区那几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自己写
import type { CSSProperties, ReactNode } from "react";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "12px",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot
      count={10000}
      estimateSize={36}
      style={{ blockSize: "260px", inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ virtualItems, startIndex, endIndex }) => (
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            {virtualItems.map(item => (
              <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                {\`第 \${item.index + 1} 条 · 可视区 \${startIndex} – \${endIndex}\`}
              </XhVirtualizerItem>
            ))}
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};
