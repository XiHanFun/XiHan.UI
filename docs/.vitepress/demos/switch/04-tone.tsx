// 语气 | tone 决定选中态轨道用哪族颜色，所以这里都置为开
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {tones.map(t => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <XhSwitch tone={t} defaultChecked />
          <span>{t}</span>
        </span>
      ))}
    </div>
  );
}
