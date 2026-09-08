// 语气 | tone 决定数值与前后缀用哪族颜色，标签始终保持弱前景
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

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
      {tones.map(t => (
        <XhStatisticRoot key={t} tone={t}>
          <XhStatisticLabel>{t}</XhStatisticLabel>
          <XhStatisticPrefix><XhIcon icon={ArrowUpIcon} /></XhStatisticPrefix>
          <XhStatisticValue>24.8</XhStatisticValue>
          <XhStatisticSuffix>%</XhStatisticSuffix>
        </XhStatisticRoot>
      ))}
    </div>
  );
}
