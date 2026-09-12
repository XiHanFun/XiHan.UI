// 变体 | 设置整组外观
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const variants = [
  { label: "主要", variant: "solid", tone: "brand" },
  { label: "次要", variant: "subtle", tone: "brand" },
  { label: "第三", variant: "subtle", tone: "neutral" },
  { label: "线框", variant: "outline", tone: undefined },
  { label: "幽灵", variant: "ghost", tone: undefined },
  { label: "危险", variant: "solid", tone: "danger" },
] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      {variants.map(item => (
        <div key={item.label} style={{ display: "grid", gap: "6px" }}>
          <span>{item.label}</span>
          <XhButtonGroup variant={item.variant} tone={item.tone}>
            {views.map(label => <XhButton key={label}>{label}</XhButton>)}
          </XhButtonGroup>
        </div>
      ))}
    </div>
  );
}
