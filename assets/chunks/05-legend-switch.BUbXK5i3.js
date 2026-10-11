var e=`// 总开关放进 legend | 按 HTML 规范，首个 legend 中的控件不受 fieldset[disabled] 连带影响，总开关因此始终可点击
import type { ReactNode } from "react";
import {
  XhCheckbox,
  XhFieldsetDescription,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhSelectRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const frequencies = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
];

export default function Demo(): ReactNode {
  const [enabled, setEnabled] = useState(false);

  return (
    <XhFieldsetRoot disabled={!enabled} style={{ inlineSize: "320px" }}>
      <XhFieldsetLegend>
        <XhCheckbox checked={enabled} onCheckedChange={details => setEnabled(details.checked === true)}>
          启用自动备份
        </XhCheckbox>
      </XhFieldsetLegend>
      <XhSelectRoot collection={frequencies} defaultValue={["daily"]} label="备份频率" />
      <XhCheckbox>失败时发通知</XhCheckbox>
      <XhFieldsetDescription>关掉总开关，下面两项跟着停用，唯独总开关自己还能点</XhFieldsetDescription>
    </XhFieldsetRoot>
  );
}
`;export{e as default};