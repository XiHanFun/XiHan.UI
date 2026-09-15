const r=`// 挂自绘滚动条 | 滚动容器是视口，给它一个 id 交给滚动条即可；虚拟滚动只管渲哪几条，滚动条只管画滚动位置
import type { CSSProperties, ReactNode } from "react";
import {
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
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
      {({ virtualItems }) => (
        <>
          {/* 视口给个 id，滚动条按 controls 找到它；挂上后原生滚动条自动藏起来 */}
          <XhVirtualizerViewport id="virtualizer-scrollbar-viewport">
            <XhVirtualizerContent>
              {virtualItems.map(item => (
                <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                  {\`第 \${item.index + 1} 条\`}
                </XhVirtualizerItem>
              ))}
            </XhVirtualizerContent>
          </XhVirtualizerViewport>
          <XhScrollbarRoot controls="virtualizer-scrollbar-viewport" type="always">
            <XhScrollbarTrack>
              <XhScrollbarThumb />
            </XhScrollbarTrack>
          </XhScrollbarRoot>
        </>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{r as default};
