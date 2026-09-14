// 横向列表 | horizontal 把主轴换成行内轴：位移改写进行首侧，条目宽度由作者写，gap 由内核直接算进位移
import type { CSSProperties, ReactNode } from "react";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const cardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "120px",
  blockSize: "68px",
  border: "1px solid var(--xh-border-subtle)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot
      count={500}
      estimateSize={120}
      gap={8}
      horizontal
      style={{ blockSize: "96px", inlineSize: "100%", maxInlineSize: "420px" }}
    >
      {({ virtualItems }) => (
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            {virtualItems.map(item => (
              <XhVirtualizerItem key={item.key} value={item.index} style={cardStyle}>
                {`第 ${item.index + 1} 张`}
              </XhVirtualizerItem>
            ))}
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      )}
    </XhVirtualizerRoot>
  );
}
