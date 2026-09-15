const n=`// 空态与形态 | 一行也摊不出来时空态那一格站出来说话；variant="plain" 去掉外框与底色
import type { ReactNode } from "react";
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [payload, setPayload] = useState<unknown>(undefined);

  function toggle(): void {
    setPayload(payload === undefined ? { id: 7, label: "曦寒" } : undefined);
  }

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <XhButton size="sm" variant="outline" onClick={toggle}>
        {payload === undefined ? "喂一份数据" : "把数据撤掉"}
      </XhButton>

      {/* 不写这一格即铺 translations.empty 那句话 */}
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={2} empty="这份接口还没有返回内容" />

      <XhJsonViewerRoot value={payload} defaultExpandedDepth={2} variant="plain" />
    </div>
  );
}
`;export{n as default};
