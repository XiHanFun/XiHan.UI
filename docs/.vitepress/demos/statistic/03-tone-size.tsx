// 语气与尺寸 | tone 决定数值与前后缀使用哪族颜色，标签始终保持弱前景；size 改变标签、数值与前后缀的字号，不传 size 即默认档
import type { ReactNode } from "react";
import { ArrowUpIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhStatisticLabel,
  XhStatisticPrefix,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-8)" }}>
        {tones.map(t => (
          <XhStatisticRoot key={t} tone={t}>
            <XhStatisticLabel>{t}</XhStatisticLabel>
            <XhStatisticPrefix><XhIcon icon={ArrowUpIcon} /></XhStatisticPrefix>
            <XhStatisticValue>24.8</XhStatisticValue>
            <XhStatisticSuffix>%</XhStatisticSuffix>
          </XhStatisticRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--xh-space-8)" }}>
        {sizes.map(s => (
          <XhStatisticRoot key={s.label} size={s.size}>
            <XhStatisticLabel>{s.label}</XhStatisticLabel>
            <XhStatisticValue>86.7</XhStatisticValue>
            <XhStatisticSuffix>%</XhStatisticSuffix>
          </XhStatisticRoot>
        ))}
      </div>
    </div>
  );
}
