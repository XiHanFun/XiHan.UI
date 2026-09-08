// 形态、语气与尺寸 | 三轴打在 root 上沿继承流下发给每一段，条目自己不写任何一档
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <XhToggleGroupRoot collection={spans} defaultValue="day" variant="solid" />
      <XhToggleGroupRoot collection={spans} defaultValue="day" variant="outline" />
      <XhToggleGroupRoot collection={spans} defaultValue="day" variant="ghost" />

      <XhToggleGroupRoot collection={spans} defaultValue="week" tone="neutral" />
      <XhToggleGroupRoot collection={spans} defaultValue="week" tone="success" />

      <XhToggleGroupRoot collection={spans} defaultValue="month" size="sm" />
      <XhToggleGroupRoot collection={spans} defaultValue="month" size="lg" />
    </div>
  );
}
