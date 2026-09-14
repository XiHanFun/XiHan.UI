// 语气 | tone 决定进度段用哪族颜色，不写时沿用品牌色
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      {tones.map(t => (
        <div key={t} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ minWidth: "64px", fontSize: "13px", opacity: 0.7 }}>{t}</span>
          <XhProgress value={65} tone={t} style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  );
}
