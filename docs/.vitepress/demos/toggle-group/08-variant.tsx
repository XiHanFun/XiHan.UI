// 变体 | 设置整组外观
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const variants = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      {variants.map(variant => (
        <XhToggleGroupRoot
          key={variant}
          collection={options}
          defaultValue="week"
          variant={variant}
        />
      ))}
    </div>
  );
}
