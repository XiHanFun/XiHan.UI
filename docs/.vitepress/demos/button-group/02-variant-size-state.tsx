// 形态、尺寸与状态 | variant 与 tone 设置整组外观，size 设置整组尺寸，disabled 禁用整组按钮
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
const sizes = ["sm", "md", "lg"] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)", justifyItems: "start" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start" }}>
        {variants.map(item => (
          <div key={item.label} style={{ display: "grid", gap: "var(--xh-space-2)" }}>
            <span>{item.label}</span>
            <XhButtonGroup variant={item.variant} tone={item.tone}>
              {views.map(label => <XhButton key={label}>{label}</XhButton>)}
            </XhButtonGroup>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)" }}>
        {sizes.map(s => (
          <XhButtonGroup key={s} size={s}>
            {views.map(view => <XhButton key={view}>{view}</XhButton>)}
          </XhButtonGroup>
        ))}
      </div>

      <XhButtonGroup disabled>
        <XhButton>照片</XhButton>
        <XhButton>视频</XhButton>
        <XhButton>更多</XhButton>
      </XhButtonGroup>
    </div>
  );
}
