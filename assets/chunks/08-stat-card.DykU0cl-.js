var e=`// 指标卡 | 与统计数值组合：数值给出现在是多少，迷你图给出是怎么走到这里的；尺寸由组件槽放大到铺满卡片
import type { CSSProperties, ReactNode } from "react";
import {
  XhCardContent,
  XhCardRoot,
  XhSparkline,
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticTrend,
  XhStatisticValue,
} from "@xihan-ui/react";

const revenue = [86, 92, 88, 97, 104, 99, 112, 118, 115, 126, 131, 138];

export default function Demo(): ReactNode {
  return (
    <XhCardRoot style={{ inlineSize: "18rem", maxInlineSize: "100%" }}>
      <XhCardContent style={{ display: "grid", gap: "var(--xh-space-3)" }}>
        <XhStatisticRoot tone="success" trend="up">
          <XhStatisticLabel>本月营收</XhStatisticLabel>
          <XhStatisticValue>138</XhStatisticValue>
          <XhStatisticSuffix>万元</XhStatisticSuffix>
          <XhStatisticTrend>较上月 5.3%</XhStatisticTrend>
        </XhStatisticRoot>
        <XhSparkline
          data={revenue}
          variant="area"
          aria-label="近 12 个月营收"
          style={{ "--xh-sparkline-width": "100%", "--xh-sparkline-height": "var(--xh-space-8)" } as CSSProperties}
        />
      </XhCardContent>
    </XhCardRoot>
  );
}
`;export{e as default};