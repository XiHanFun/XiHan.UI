const e=`// 整组禁用 | disabled 落成原生 fieldset[disabled]，组内每个控件一并停掉，不必逐个写 disabled
import type { ReactNode } from "react";
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [locked, setLocked] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "320px" }}>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="checkbox" checked={locked} onChange={e => setLocked(e.target.checked)} />
        锁定这段设置
      </label>
      <XhFieldsetRoot disabled={locked}>
        <XhFieldsetLegend>发票抬头</XhFieldsetLegend>
        <input type="text" placeholder="公司名称" style={{ inlineSize: "100%" }} />
        <input type="text" placeholder="纳税人识别号" style={{ inlineSize: "100%" }} />
        <XhFieldsetDescription>锁定期间这两个输入框既不能聚焦，也不参与提交</XhFieldsetDescription>
      </XhFieldsetRoot>
    </div>
  );
}
`;export{e as default};
