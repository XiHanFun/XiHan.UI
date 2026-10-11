var e=`// 整组禁用 | disabled 写为原生 fieldset[disabled]，组内每个控件一并禁用，不必逐个写 disabled
import type { ReactNode } from "react";
import {
  XhCheckbox,
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetDescription,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [locked, setLocked] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "320px" }}>
      <XhCheckbox checked={locked} onCheckedChange={details => setLocked(details.checked === true)}>
        锁定这段设置
      </XhCheckbox>
      <XhFieldsetRoot disabled={locked}>
        <XhFieldsetLegend>发票抬头</XhFieldsetLegend>
        <XhFieldRoot>
          <XhFieldLabel>公司名称</XhFieldLabel>
          <XhFieldControl>
            <input type="text" />
          </XhFieldControl>
        </XhFieldRoot>
        <XhFieldRoot>
          <XhFieldLabel>纳税人识别号</XhFieldLabel>
          <XhFieldControl>
            <input type="text" />
          </XhFieldControl>
        </XhFieldRoot>
        <XhFieldsetDescription>锁定期间这两个输入框既不能聚焦，也不参与提交</XhFieldsetDescription>
      </XhFieldsetRoot>
    </div>
  );
}
`;export{e as default};