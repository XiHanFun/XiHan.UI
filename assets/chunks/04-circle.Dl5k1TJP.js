var e=`// 圆形网格 | shape="circle" 把网格画成同心圆：指标多、多边形的折角显得杂乱时更安静
import type { ReactNode } from "react";
import { XhRadarChartRoot } from "@xihan-ui/react";

const people = [
  { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
  { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
];

const indicators = [
  { key: "design", label: "设计" },
  { key: "frontend", label: "前端" },
  { key: "backend", label: "后端" },
  { key: "testing", label: "测试" },
  { key: "communication", label: "沟通" },
  { key: "planning", label: "规划" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhRadarChartRoot
      data={people}
      nameField="name"
      indicators={indicators}
      shape="circle"
      caption="两名工程师的能力评估"
    />
  );
}
`;export{e as default};