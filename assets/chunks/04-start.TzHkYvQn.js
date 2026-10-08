var e=`// 靠左对齐 | align="start" 让阶段靠起始边对齐，逐级缩短看得更清楚
import type { ReactNode } from "react";
import { XhFunnelChartRoot } from "@xihan-ui/react";

const steps = [
  { stage: "收到简历", users: 860 },
  { stage: "简历通过", users: 310 },
  { stage: "一面", users: 150 },
  { stage: "二面", users: 64 },
  { stage: "发放录用", users: 18 },
];

export default function Demo(): ReactNode {
  return (
    <XhFunnelChartRoot
      data={steps}
      nameField="stage"
      valueField="users"
      align="start"
      shape="bar"
      caption="招聘流程"
    />
  );
}
`;export{e as default};