var e=`// 仪表盘 | 量（semantics="meter"）的仪表盘：thresholds 画出分段色带，scale 画出量程刻度，indicator 选填充或指针
import type { ProgressThreshold } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

// 分段按上界升序：当前值落在哪一段，填充就取那一段的语气，读屏在数值后补上分段名
const zones: ProgressThreshold[] = [
  { value: 60, tone: "success", label: "正常" },
  { value: 85, tone: "warning", label: "警戒" },
  { value: 100, tone: "danger", label: "过载" },
];
// 读屏文字的模板按语言改写：缺省是英文的「72%, 警戒」
const translations = { segmentValueText: ({ value, label }: { value: string; label: string }) => \`\${value}，\${label}\` };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-8)", flexWrap: "wrap" }}>
      <XhProgress
        variant="dashboard"
        semantics="meter"
        value={72}
        thresholds={zones}
        scale
        size="lg"
        translations={translations}
        aria-label="CPU 占用"
      >
        <strong style={{ fontSize: "var(--xh-text-heading-3-size)" }}>72%</strong>
      </XhProgress>
      <XhProgress
        variant="dashboard"
        semantics="meter"
        value={72}
        thresholds={zones}
        scale
        indicator="needle"
        size="lg"
        translations={translations}
        aria-label="CPU 占用"
      >
        <span>72%</span>
      </XhProgress>
    </div>
  );
}
`;export{e as default};