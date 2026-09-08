// 尺寸 | size 换的是每格的内边距、组与组的间距与整体字号，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const rows = [
  { label: "状态", value: "已发货" },
  { label: "承运商", value: "顺丰速运" },
];

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {sizes.map(s => (
        <XhDescriptionsRoot
          key={s.label}
          size={s.size}
          bordered
          columns={2}
          placement="left"
        >
          {rows.map(row => (
            <XhDescriptionsItem key={row.label}>
              <XhDescriptionsLabel>{`${s.label} · ${row.label}`}</XhDescriptionsLabel>
              <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
            </XhDescriptionsItem>
          ))}
        </XhDescriptionsRoot>
      ))}
    </div>
  );
}
