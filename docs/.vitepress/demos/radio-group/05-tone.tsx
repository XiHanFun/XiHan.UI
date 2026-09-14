// 语气 | tone 决定选中圆点用哪族颜色，六种语气各一组
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const answers = [
  { value: "yes", label: "选中" },
  { value: "no", label: "未选" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      {tones.map(t => (
        <XhRadioGroupRoot
          key={t}
          collection={answers}
          label={t}
          tone={t}
          defaultValue="yes"
        />
      ))}
    </div>
  );
}
