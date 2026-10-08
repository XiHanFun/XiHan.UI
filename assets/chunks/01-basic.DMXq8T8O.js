var e=`// 基础用法 | 一行数据一个实体：nameField 取实体名字段，indicators 列出指标；每个指标一根轴，自 12 点顺时针排开
import type { ReactNode } from "react";
import { XhRadarChartRoot } from "@xihan-ui/react";

// 每行一个实体，指标的值都是 0–100 的评分
const phones = [
  { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
  { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
];

// 指标按顺时针排开；相关的指标排在相邻的位置
const indicators = [
  { key: "camera", label: "影像" },
  { key: "battery", label: "续航" },
  { key: "screen", label: "屏幕" },
  { key: "performance", label: "性能" },
  { key: "price", label: "性价比" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhRadarChartRoot
      data={phones}
      nameField="model"
      indicators={indicators}
      caption="两款手机的评测得分"
    />
  );
}
`;export{e as default};