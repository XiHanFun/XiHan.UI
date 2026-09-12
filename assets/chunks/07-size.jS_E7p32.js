const e=`// 尺寸 | size 三档只换字号与层级缩进，行的结构与配色都不变
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = { id: 7, label: "曦寒", nested: { ok: true } };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={2} size="sm" />
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={2} size="md" />
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={2} size="lg" />
    </div>
  );
}
`;export{e as default};
