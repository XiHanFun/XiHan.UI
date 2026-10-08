var e=`// 虚拟滚动 | 行数很大时把日志与 Virtualizer 接线：virtualizer 交出 collectionVirtualizer，行放进 Virtualizer 的条目里，只挂窗口里的那些；粘底跟着 Virtualizer 的视口走
import type { CSSProperties, ReactNode } from "react";
import {
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const lines = Array.from({ length: 10000 }, (_, index) =>
  \`\${String(index + 1).padStart(5, "0")}  GET /api/orders/\${8000 + index}  200  \${(index % 90) + 10}ms\`);

const rootStyle: CSSProperties = { inlineSize: "100%" };

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot count={lines.length} estimateSize={20} style={rootStyle}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhLogRoot rows={10} virtualizer={collectionVirtualizer}>
          <XhLogViewport>
            <XhVirtualizerViewport>
              <XhVirtualizerContent>
                {virtualItems.map(item => (
                  <XhVirtualizerItem key={item.key} value={item.index}>
                    <XhLogLine>{lines[item.index]}</XhLogLine>
                  </XhVirtualizerItem>
                ))}
              </XhVirtualizerContent>
            </XhVirtualizerViewport>
          </XhLogViewport>
        </XhLogRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};