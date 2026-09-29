const n=`// 随整页滚动 | scrollContainer 设为 window：列表铺在页面里，不另开滚动框，列表上方的内容不必再算 scrollMargin
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
    // root 不定高：视口随内容撑开，滚的是整页
    <XhVirtualizerRoot
      count={200}
      estimateSize={36}
      scrollContainer="window"
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
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
  );
}
`;export{n as default};
