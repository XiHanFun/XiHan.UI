// 动态高度 | 条目开了 measure 就把真实尺寸回喂给内核，estimateSize 只是首帧的起点，滚过一遍就收敛
import type { CSSProperties, ReactNode } from "react";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

// 每条的文字长度不同，渲出来的高度自然也不同
const rows = Array.from({ length: 500 }, (_, i) => ({
  index: i,
  text: `第 ${i + 1} 条 —— ${"这一段是用来把行撑高的占位文字。".repeat((i % 4) + 1)}`,
}));

const rowStyle: CSSProperties = {
  padding: "8px 12px",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
  lineHeight: "20px",
};

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot
      count={rows.length}
      estimateSize={64}
      style={{ blockSize: "260px", inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ virtualItems, totalSize }) => (
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            {/* 不给主轴尺寸：给了就把测量钉死在估算值上，measure 再也收敛不了 */}
            {virtualItems.map(item => (
              <XhVirtualizerItem key={item.key} value={item.index} measure style={rowStyle}>
                {rows[item.index]?.text}
                <small>{`（实测 ${Math.round(item.size)}px · 总长 ${Math.round(totalSize)}px）`}</small>
              </XhVirtualizerItem>
            ))}
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      )}
    </XhVirtualizerRoot>
  );
}
