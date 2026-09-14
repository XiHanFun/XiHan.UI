// 一万条只渲可视区 | 面板插槽给的是本侧此刻看得见的全集，作者按滚动位置切一段挂出来，上下各留一个撑高块；全选、计数与搬运不读 DOM，照样管到窗口外
import type { TransferItem } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode, UIEvent } from "react";
import {
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
} from "@xihan-ui/react";
import { useState } from "react";

// 行高与列表高度写死，窗口才算得出来
const ROW = 30;
const VIEW = 240;
const OVERSCAN = 6;

const listStyle = {
  "--xh-transfer-list-h": "240px",
} as CSSProperties;

const items: TransferItem[] = Array.from({ length: 10000 }, (_, i) => ({
  value: `sku-${i + 1}`,
  label: `商品 SKU-${String(i + 1).padStart(5, "0")}`,
}));

export default function Demo(): ReactNode {
  // 两侧各记一份滚动位置
  const [scrolled, setScrolled] = useState<Record<string, number>>({ source: 0, target: 0 });
  const [value, setValue] = useState<string[]>(["sku-3"]);

  function onScroll(side: string, event: UIEvent<HTMLElement>): void {
    const top = (event.target as HTMLElement).scrollTop;
    setScrolled(prev => ({ ...prev, [side]: top }));
  }

  // 该挂出来的那一段：可视区前后各多铺几条，方向键走到边上时下一条已经在 DOM 里
  function range(side: string, list: readonly TransferItem[]): { start: number; end: number } {
    const max = Math.max(0, list.length * ROW - VIEW);
    const top = Math.min(scrolled[side] ?? 0, max);
    const start = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
    const end = Math.min(list.length, Math.ceil((top + VIEW) / ROW) + OVERSCAN);
    return { start, end };
  }

  function rowsOf(side: string, list: readonly TransferItem[]): TransferItem[] {
    const { start, end } = range(side, list);
    return list.slice(start, end);
  }

  function padStartOf(side: string, list: readonly TransferItem[]): number {
    return range(side, list).start * ROW;
  }

  function padEndOf(side: string, list: readonly TransferItem[]): number {
    return (list.length - range(side, list).end) * ROW;
  }

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "560px" }}>
      <XhTransferRoot
        value={value}
        collection={items}
        searchable
        onValueChange={details => setValue(details.value)}
      >
        <XhTransferSourcePanel>
          {({ items: shown }) => (
            <>
              <XhTransferPanelHeader>
                <XhTransferPanelTitle>全部商品</XhTransferPanelTitle>
                <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
                <XhTransferPanelCount />
              </XhTransferPanelHeader>
              <XhTransferSearch placeholder="搜索编号" />
              <XhTransferList style={listStyle} onScroll={event => onScroll("source", event)}>
                <div
                  aria-hidden="true"
                  style={{ flex: "none", blockSize: `${padStartOf("source", shown)}px` }}
                />
                {rowsOf("source", shown).map(item => (
                  <XhTransferItem
                    key={item.value}
                    value={item.value}
                    style={{ blockSize: `${ROW}px` }}
                  >
                    <XhTransferItemCheckbox />
                    <XhTransferItemText>{item.label}</XhTransferItemText>
                  </XhTransferItem>
                ))}
                <div
                  aria-hidden="true"
                  style={{ flex: "none", blockSize: `${padEndOf("source", shown)}px` }}
                />
              </XhTransferList>
            </>
          )}
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          {({ items: shown }) => (
            <>
              <XhTransferPanelHeader>
                <XhTransferPanelTitle>本次上架</XhTransferPanelTitle>
                <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
                <XhTransferPanelCount />
              </XhTransferPanelHeader>
              <XhTransferSearch placeholder="搜索编号" />
              <XhTransferList style={listStyle} onScroll={event => onScroll("target", event)}>
                <div
                  aria-hidden="true"
                  style={{ flex: "none", blockSize: `${padStartOf("target", shown)}px` }}
                />
                {rowsOf("target", shown).map(item => (
                  <XhTransferItem
                    key={item.value}
                    value={item.value}
                    style={{ blockSize: `${ROW}px` }}
                  >
                    <XhTransferItemCheckbox />
                    <XhTransferItemText>{item.label}</XhTransferItemText>
                  </XhTransferItem>
                ))}
                <div
                  aria-hidden="true"
                  style={{ flex: "none", blockSize: `${padEndOf("target", shown)}px` }}
                />
              </XhTransferList>
            </>
          )}
        </XhTransferTargetPanel>
      </XhTransferRoot>

      <p style={{ marginBlockStart: "12px", fontSize: "13px" }}>
        {`已上架 ${value.length} 件`}
      </p>
    </div>
  );
}
