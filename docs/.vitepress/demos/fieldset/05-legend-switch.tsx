// 总开关放进 legend | 按 HTML 规范，首个 legend 里的控件不受 fieldset[disabled] 连坐，总开关因此始终可点
import type { ReactNode } from "react";
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [enabled, setEnabled] = useState(false);

  return (
    <XhFieldsetRoot disabled={!enabled} style={{ inlineSize: "320px" }}>
      <XhFieldsetLegend>
        <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          启用自动备份
        </label>
      </XhFieldsetLegend>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        备份频率
        <select>
          <option>每天</option>
          <option>每周</option>
        </select>
      </label>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="checkbox" />
        失败时发通知
      </label>
      <XhFieldsetDescription>关掉总开关，下面两项跟着停用，唯独总开关自己还能点</XhFieldsetDescription>
    </XhFieldsetRoot>
  );
}
