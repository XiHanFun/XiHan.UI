const e=`// 原文视图 | view="text" 直接出缩进过的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";
import { useState } from "react";

const payload = {
  orderNo: "SO-2026-0825-0417",
  amount: 12.5,
  items: [
    { sku: "A-1001", qty: 2 },
    { sku: "B-2003", qty: 1 },
  ],
  remark: "跨境订单，需人工复核收件地址与税号",
};

export default function Demo(): ReactNode {
  const [view, setView] = useState<"tree" | "text">("text");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="checkbox"
          checked={view === "text"}
          onChange={event => setView(event.target.checked ? "text" : "tree")}
        />
        原文视图
      </label>
      <XhJsonViewerRoot value={payload} view={view} defaultExpandedDepth={2} />
    </div>
  );
}
`;export{e as default};
