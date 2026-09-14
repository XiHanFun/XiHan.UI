// 标签位置 | placement 决定标签在上还是在左，不传即在上
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const rows = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
];

// 上面那一档不写 placement，用 undefined 表达
const placements = [
  { placement: undefined, caption: "标签在上（默认）" },
  { placement: "left", caption: "标签在左" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {placements.map(p => (
        <div key={p.caption} style={{ inlineSize: "260px" }}>
          <p>{p.caption}</p>
          <XhDescriptionsRoot placement={p.placement}>
            {rows.map(row => (
              <XhDescriptionsItem key={row.label}>
                <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
                <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
              </XhDescriptionsItem>
            ))}
          </XhDescriptionsRoot>
        </div>
      ))}
    </div>
  );
}
