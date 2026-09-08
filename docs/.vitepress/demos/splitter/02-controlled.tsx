// 受控 | 传了 sizes 就由宿主说了算；sizes-change 拖动途中连着发，sizes-change-end 松手才发一次
import type { ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const panels = [{ id: "aside", min: 20 }, { id: "main", min: 20 }];

export default function Demo(): ReactNode {
  const [size, setSize] = useState([30, 70]);
  const [lastEnd, setLastEnd] = useState("（还没拖过）");

  function onSizeChangeEnd(details: { sizes: number[]; index: number }): void {
    setLastEnd(`第 ${details.index} 条 → ${details.sizes
      .map(n => `${Math.round(n)}%`)
      .join(" / ")}`);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <XhSplitterRoot
        sizes={size}
        onSizesChange={details => setSize(details.sizes)}
        panels={panels}
        style={{ blockSize: "140px" }}
        onSizesChangeEnd={onSizeChangeEnd}
      >
        <XhSplitterPanel index={0}>
          <p style={{ padding: "12px" }}>侧栏</p>
        </XhSplitterPanel>
        <XhSplitterResizeTrigger index={0} />
        <XhSplitterPanel index={1}>
          <p style={{ padding: "12px" }}>正文</p>
        </XhSplitterPanel>
      </XhSplitterRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setSize([30, 70])}>复位到 30 / 70</button>
        <span>{`当前：${size.map(n => `${Math.round(n)}%`).join(" / ")}`}</span>
        <span>{`上次收尾：${lastEnd}`}</span>
      </div>
    </div>
  );
}
