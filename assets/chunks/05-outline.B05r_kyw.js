var e=`// 只画轮廓 | area 关掉淡洗，只留轮廓线与顶点：实体多、面积叠在一起互相遮挡时更容易分辨
import type { ReactNode } from "react";
import { XhRadarChartRoot } from "@xihan-ui/react";

const phones = [
  { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
  { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
  { model: "入门机", camera: 55, battery: 90, screen: 60, performance: 52, price: 95 },
];

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
      area={false}
      caption="三款手机的评测得分"
    />
  );
}
`;export{e as default};