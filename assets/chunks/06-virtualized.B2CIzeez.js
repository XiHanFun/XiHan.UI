var e=`// 集合虚拟化 | collection 保留完整语义，Virtualizer 只决定当前挂载哪些 option
import type { CSSProperties, ReactNode } from "react";
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const items = Array.from({ length: 1000 }, (_, index) => ({
  value: \`member-\${index + 1}\`,
  label: \`成员 \${index + 1}\`,
}));

const rootStyle: CSSProperties = { inlineSize: "min(100%, 320px)" };
const contentStyle: CSSProperties = { overflow: "visible", maxBlockSize: "none" };
const viewportStyle: CSSProperties = { blockSize: 240 };
const itemStyle: CSSProperties = { blockSize: 36 };

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot count={items.length} estimateSize={36} viewportTabIndex={-1} style={rootStyle}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhListboxRoot collection={items} virtualizer={collectionVirtualizer}>
          <XhListboxLabel>团队成员</XhListboxLabel>
          <XhListboxContent style={contentStyle}>
            <XhVirtualizerViewport style={viewportStyle}>
              <XhVirtualizerContent>
                {virtualItems.map(virtualItem => (
                  <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
                    <XhListboxItem value={items[virtualItem.index]!.value}>
                      <XhListboxItemText>{items[virtualItem.index]!.label}</XhListboxItemText>
                      <XhListboxItemIndicator />
                    </XhListboxItem>
                  </XhVirtualizerItem>
                ))}
              </XhVirtualizerContent>
            </XhVirtualizerViewport>
          </XhListboxContent>
        </XhListboxRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};