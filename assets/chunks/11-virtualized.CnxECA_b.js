var e=`// 双侧虚拟化 | 每个面板拥有独立窗口，搬运与搜索仍按该侧完整可见集合计算
import type { CollectionVirtualizer, TransferItem, TransferSide } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import {
  XhTransferEmpty,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useCallback, useRef, useState } from "react";

const items: TransferItem[] = Array.from({ length: 500 }, (_, index) => ({ value: \`permission-\${index + 1}\`, label: \`权限 \${index + 1}\` }));
const itemStyle: CSSProperties = { blockSize: 36 };
const rootStyle: CSSProperties = { inlineSize: "100%", maxInlineSize: 640 };

function Capture({ side, bridge, onReady, children }: { side: TransferSide; bridge: CollectionVirtualizer; onReady: (side: TransferSide, bridge: CollectionVirtualizer) => void; children: ReactNode }): ReactNode {
  onReady(side, bridge);
  return children;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState(items.slice(0, 20).map(item => item.value));
  const bridges = useRef<Partial<Record<TransferSide, CollectionVirtualizer>>>({});
  const onReady = useCallback((side: TransferSide, bridge: CollectionVirtualizer): void => {
    bridges.current[side] = bridge;
  }, []);
  const panel = (side: TransferSide, panelItems: readonly TransferItem[]): ReactNode => (
    <>
      <XhTransferPanelHeader>
        <XhTransferPanelTitle>{side === "source" ? "待选权限" : "已选权限"}</XhTransferPanelTitle>
        <XhTransferPanelCount />
        <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
      </XhTransferPanelHeader>
      <XhTransferSearch placeholder={side === "source" ? "搜索待选权限" : "搜索已选权限"} />
      <XhVirtualizerRoot count={panelItems.length} estimateSize={36} viewportTabIndex={-1}>
        {slot => (
          <Capture side={side} bridge={slot.collectionVirtualizer} onReady={onReady}>
            <XhTransferList>
              <XhVirtualizerViewport>
                <XhVirtualizerContent>
                  {slot.virtualItems.map(virtualItem => (
                    <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
                      <XhTransferItem value={panelItems[virtualItem.index]!.value}>
                        <XhTransferItemCheckbox />
                        <XhTransferItemText>{panelItems[virtualItem.index]!.label}</XhTransferItemText>
                      </XhTransferItem>
                    </XhVirtualizerItem>
                  ))}
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhTransferList>
          </Capture>
        )}
      </XhVirtualizerRoot>
      <XhTransferEmpty>{side === "source" ? "暂无待选权限" : "暂无已选权限"}</XhTransferEmpty>
    </>
  );
  return (
    <div style={rootStyle}>
      <XhTransferRoot collection={items} value={value} onValueChange={details => setValue(details.value)} virtualizers={bridges.current} searchable>
        <XhTransferSourcePanel>{({ items: panelItems }) => panel("source", panelItems)}</XhTransferSourcePanel>
        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />
        <XhTransferTargetPanel>{({ items: panelItems }) => panel("target", panelItems)}</XhTransferTargetPanel>
      </XhTransferRoot>
    </div>
  );
}
`;export{e as default};