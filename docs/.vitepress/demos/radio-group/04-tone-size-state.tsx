// 语气、尺寸与状态 | tone 决定选中圆点使用哪族颜色；size 改变条目间距与字号，不写即默认中档；单项禁用后不可点击、方向键也跳过它，整组禁用则每一项都随之禁用
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const answers = [
  { value: "yes", label: "选中" },
  { value: "no", label: "未选" },
];
const sizePlans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
];
const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版", disabled: true },
];
const openPlans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap" }}>
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

      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap", alignItems: "flex-start" }}>
        <XhRadioGroupRoot
          collection={sizePlans}
          defaultValue="standard"
          label="sm"
          size="sm"
        />

        <XhRadioGroupRoot collection={sizePlans} defaultValue="standard" label="缺省" />

        <XhRadioGroupRoot
          collection={sizePlans}
          defaultValue="standard"
          label="lg"
          size="lg"
        />
      </div>

      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap", alignItems: "flex-start" }}>
        <XhRadioGroupRoot collection={plans} defaultValue="free" label="单项禁用" />

        <XhRadioGroupRoot
          collection={openPlans}
          defaultValue="free"
          disabled
          label="整组禁用"
        />
      </div>
    </div>
  );
}
