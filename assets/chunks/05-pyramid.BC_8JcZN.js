const n=`// 金字塔 | direction="up" 画成金字塔：第一阶段在最下面，往上逐级收窄；层级之间是包含关系，不写转化率
import type { ReactNode } from "react";
import { XhFunnelChartRoot } from "@xihan-ui/react";

const steps = [
  { stage: "普通会员", users: 48000 },
  { stage: "银卡", users: 12500 },
  { stage: "金卡", users: 3100 },
  { stage: "钻石", users: 420 },
];

export default function Demo(): ReactNode {
  return (
    <XhFunnelChartRoot
      data={steps}
      nameField="stage"
      valueField="users"
      direction="up"
      conversion="none"
      caption="会员等级分布"
    />
  );
}
`;export{n as default};
