// 形态与尺寸 | ghost 不画壳，subtle 铺一层淡底，outline 绘制一圈描边并在格与格之间补上网格线；size 改变每格的内边距、组与组的间距与整体字号，不传即默认档
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const orderRows = [
  { label: "商品", value: "机械键盘" },
  { label: "单价", value: "￥499.00" },
  { label: "数量", value: "2" },
  { label: "小计", value: "￥998.00" },
];

const variants = [
  { variant: "ghost", label: "无壳" },
  { variant: "subtle", label: "淡底" },
  { variant: "outline", label: "描边" },
] as const;

const shippingRows = [
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-8)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)" }}>
        {variants.map(v => (
          <XhDescriptionsRoot key={v.variant} variant={v.variant} columns={2} placement="left">
            {orderRows.map(row => (
              <XhDescriptionsItem key={row.label}>
                <XhDescriptionsLabel>{`${v.label} · ${row.label}`}</XhDescriptionsLabel>
                <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
              </XhDescriptionsItem>
            ))}
          </XhDescriptionsRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)" }}>
        {sizes.map(s => (
          <XhDescriptionsRoot
            key={s.label}
            size={s.size}
            variant="outline"
            columns={2}
            placement="left"
          >
            {shippingRows.map(row => (
              <XhDescriptionsItem key={row.label}>
                <XhDescriptionsLabel>{`${s.label} · ${row.label}`}</XhDescriptionsLabel>
                <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
              </XhDescriptionsItem>
            ))}
          </XhDescriptionsRoot>
        ))}
      </div>
    </div>
  );
}
