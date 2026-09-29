const e=`// 大树虚拟化 | 完整树数据负责层级与键盘语义，窗口只挂载当前可见行
import type { CSSProperties, ReactNode } from "react";
import {
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const nodes = Array.from({ length: 1000 }, (_, index) => ({ value: \`file-\${index + 1}\`, label: \`文件 \${index + 1}.ts\` }));
const rootStyle: CSSProperties = { inlineSize: "min(100%, 320px)" };
const viewportStyle: CSSProperties = { blockSize: 240 };
const treeStyle: CSSProperties = { overflow: "visible", maxBlockSize: "none" };
const itemStyle: CSSProperties = { blockSize: 36 };

export default function Demo(): ReactNode {
  return (
    <XhVirtualizerRoot count={nodes.length} estimateSize={36} viewportTabIndex={-1} style={rootStyle}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhTreeRoot collection={nodes} virtualizer={collectionVirtualizer}>
          <XhTreeLabel>项目文件</XhTreeLabel>
          <XhVirtualizerViewport style={viewportStyle}>
            <XhTreeTree style={treeStyle}>
              <XhVirtualizerContent>
                {virtualItems.map(virtualItem => (
                  <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
                    <XhTreeItem value={nodes[virtualItem.index]!.value}>
                      <XhTreeItemText>{nodes[virtualItem.index]!.label}</XhTreeItemText>
                      <XhTreeItemIndicator />
                    </XhTreeItem>
                  </XhVirtualizerItem>
                ))}
              </XhVirtualizerContent>
            </XhTreeTree>
          </XhVirtualizerViewport>
        </XhTreeRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};
