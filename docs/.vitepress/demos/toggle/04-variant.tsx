// 形态 | variant 决定颜色怎么用，未按下与已按下两档一起看才完整
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "64px" }}>未按下</span>
        {variants.map(v => <XhToggle key={v} variant={v}>{v}</XhToggle>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "64px" }}>已按下</span>
        {variants.map(v => <XhToggle key={v} variant={v} defaultPressed>{v}</XhToggle>)}
      </div>
    </div>
  );
}
