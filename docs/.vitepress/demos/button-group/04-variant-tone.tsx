// 形态与语气 | 设置整组外观
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhButtonGroup key={v} variant={v} tone="brand">
          {views.map(label => <XhButton key={label}>{label}</XhButton>)}
        </XhButtonGroup>
      ))}

      <XhButtonGroup variant="solid" tone="danger">
        {views.map(label => <XhButton key={label}>{label}</XhButton>)}
      </XhButtonGroup>
    </div>
  );
}
