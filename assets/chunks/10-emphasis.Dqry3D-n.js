var e=`// 从外面强调一块 | 受控的 activeKey 写扇区名，图就强调那一块、中心与提示框跟着显示它：图外的筛选、列表或别的图都能这样指给读者看
import type { ReactNode } from "react";
import { XhPieChartRoot, XhRadioGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];

const choices = [
  { value: "none", label: "不突出" },
  ...rows.map(row => ({ value: row.channel, label: row.channel })),
];

export default function Demo(): ReactNode {
  // 图外选中的那一项；「不突出」对应 null
  const [choice, setChoice] = useState<string | null>("none");
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start", width: "100%" }}>
      <XhRadioGroupRoot
        variant="segmented"
        value={choice}
        onValueChange={details => setChoice(details.value)}
        collection={choices}
        aria-label="突出显示的渠道"
      />
      <XhPieChartRoot
        data={rows}
        nameField="channel"
        valueField="visits"
        activeKey={choice === "none" ? null : choice}
        caption="访问来源"
        style={{ width: "100%" }}
      />
    </div>
  );
}
`;export{e as default};