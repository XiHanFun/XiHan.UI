// 双侧虚拟化 | 每个面板拥有独立窗口，搬运与搜索仍按该侧完整可见集合计算
import type { CollectionVirtualizer, TransferItem, TransferSide } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import {
  XhTransferItem, XhTransferItemCheckbox, XhTransferItemText, XhTransferList,
  XhTransferRoot, XhTransferSourcePanel, XhTransferTargetPanel, XhTransferToSourceTrigger,
  XhTransferToTargetTrigger, XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useEffect, useMemo, useState } from "react";

const items: TransferItem[] = Array.from({ length: 500 }, (_, index) => ({ value: `permission-${index + 1}`, label: `权限 ${index + 1}` }));
const listStyle: CSSProperties = { overflow: "visible", maxBlockSize: "none" };
const viewportStyle: CSSProperties = { blockSize: 220 };
const itemStyle: CSSProperties = { blockSize: 36 };

function Capture({ side, bridge, onReady, children }: { side: TransferSide; bridge: CollectionVirtualizer; onReady: (side: TransferSide, bridge: CollectionVirtualizer) => void; children: ReactNode }): ReactNode {
  useEffect(() => onReady(side, bridge), [side, bridge, onReady]);
  return children;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState(items.slice(0, 20).map(item => item.value));
  const [bridges, setBridges] = useState<Partial<Record<TransferSide, CollectionVirtualizer>>>({});
  const onReady = useMemo(() => (side: TransferSide, bridge: CollectionVirtualizer) => setBridges(current => current[side] === bridge ? current : { ...current, [side]: bridge }), []);
  const panel = (side: TransferSide, panelItems: readonly TransferItem[]) => (
    <XhVirtualizerRoot count={panelItems.length} estimateSize={36} viewportTabIndex={-1}>
      {slot => <Capture side={side} bridge={slot.collectionVirtualizer} onReady={onReady}>
        <XhTransferList style={listStyle}><XhVirtualizerViewport style={viewportStyle}><XhVirtualizerContent>
          {slot.virtualItems.map(virtualItem => <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
            <XhTransferItem value={panelItems[virtualItem.index]!.value}><XhTransferItemCheckbox /><XhTransferItemText>{panelItems[virtualItem.index]!.label}</XhTransferItemText></XhTransferItem>
          </XhVirtualizerItem>)}
        </XhVirtualizerContent></XhVirtualizerViewport></XhTransferList>
      </Capture>}
    </XhVirtualizerRoot>
  );
  return <XhTransferRoot collection={items} value={value} onValueChange={details => setValue(details.value)} virtualizers={bridges}>
    <XhTransferSourcePanel>{({ items: panelItems }) => panel("source", panelItems)}</XhTransferSourcePanel>
    <XhTransferToTargetTrigger /><XhTransferToSourceTrigger />
    <XhTransferTargetPanel>{({ items: panelItems }) => panel("target", panelItems)}</XhTransferTargetPanel>
  </XhTransferRoot>;
}
