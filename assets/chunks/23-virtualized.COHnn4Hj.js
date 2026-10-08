var e=`// 长选项虚拟化 | 完整 collection 负责选择语义，Virtualizer 负责浮层中的窗口
import type { CSSProperties, ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const options = Array.from({ length: 1000 }, (_, index) => ({ value: \`option-\${index + 1}\`, label: \`选项 \${index + 1}\` }));
const viewportStyle: CSSProperties = { blockSize: 240 };
const listStyle: CSSProperties = { overflow: "visible", maxBlockSize: "none" };
const itemStyle: CSSProperties = { blockSize: 36 };

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot count={options.length} estimateSize={36} viewportTabIndex={-1}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhSelectRoot collection={options} virtualizer={collectionVirtualizer} placeholder="请选择">
          <XhSelectLabel>长列表</XhSelectLabel>
          <XhSelectControl>
            <XhSelectTrigger>
              <XhSelectValueText />
              <XhSelectIndicator />
            </XhSelectTrigger>
          </XhSelectControl>
          <XhSelectPositioner>
            <XhSelectContent>
              <XhVirtualizerViewport style={viewportStyle}>
                <XhSelectList style={listStyle}>
                  <XhVirtualizerContent>
                    {virtualItems.map(virtualItem => (
                      <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
                        <XhSelectItem value={options[virtualItem.index]!.value}>
                          <XhSelectItemText>{options[virtualItem.index]!.label}</XhSelectItemText>
                          <XhSelectItemIndicator />
                        </XhSelectItem>
                      </XhVirtualizerItem>
                    ))}
                  </XhVirtualizerContent>
                </XhSelectList>
              </XhVirtualizerViewport>
            </XhSelectContent>
          </XhSelectPositioner>
        </XhSelectRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};