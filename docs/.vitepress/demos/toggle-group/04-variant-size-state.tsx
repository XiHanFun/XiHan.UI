// 形态、尺寸与状态 | variant 设置整组外观，size 提供三种尺寸；状态落在单个选项上，禁用的那一项不可切换
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const variants = ["solid", "subtle", "outline", "ghost"] as const;

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start" }}>
        {variants.map(variant => (
          <XhToggleGroupRoot
            key={variant}
            collection={options}
            defaultValue="week"
            variant={variant}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-3)" }}>
        <XhToggleGroupRoot collection={options} defaultValue="day" size="sm" />
        <XhToggleGroupRoot collection={options} defaultValue="week" />
        <XhToggleGroupRoot collection={options} defaultValue="month" size="lg" />
      </div>

      <div style={{ display: "flex" }}>
        <XhToggleGroupRoot collection={aligns} defaultValue="center" />
      </div>
    </div>
  );
}
