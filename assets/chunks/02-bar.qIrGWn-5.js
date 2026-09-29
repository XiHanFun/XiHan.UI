const e=`// 条形 | shape="bar" 画成等高的条形：阶段之间要仔细比较宽度时比梯形的斜边好对齐
import type { ReactNode } from "react";
import { XhFunnelChartRoot } from "@xihan-ui/react";

const steps = [
  { stage: "浏览商品", users: 12800 },
  { stage: "加入购物车", users: 5200 },
  { stage: "提交订单", users: 2300 },
  { stage: "完成支付", users: 1850 },
  { stage: "再次购买", users: 620 },
];

export default function Demo(): ReactNode {
  return (
    <XhFunnelChartRoot
      data={steps}
      nameField="stage"
      valueField="users"
      shape="bar"
      caption="本月购买流程"
    />
  );
}
`;export{e as default};
