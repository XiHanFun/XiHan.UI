var e=`// 指定量程 | 指标上写 min / max 固定量程：单位不同的指标各自按自己的尺度读，数据变了轴也不跳
import type { ReactNode } from "react";
import { XhRadarChartRoot } from "@xihan-ui/react";

// 五个指标的单位各不相同：客流是人次、客单价是元、复购率是百分比……
const stores = [
  { store: "旗舰店", traffic: 5200, basket: 168, repeat: 42, rating: 4.7, staff: 18 },
  { store: "社区店", traffic: 2100, basket: 96, repeat: 58, rating: 4.5, staff: 7 },
];

// 每个指标固定自己的量程，写在指标名里读者才知道轴的尺度
const indicators = [
  { key: "traffic", label: "客流（人次）", max: 6000 },
  { key: "basket", label: "客单价（元）", max: 200 },
  { key: "repeat", label: "复购率（%）", max: 100 },
  { key: "rating", label: "评分", min: 3, max: 5 },
  { key: "staff", label: "店员（人）", max: 20 },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhRadarChartRoot
      data={stores}
      nameField="store"
      indicators={indicators}
      caption="门店经营指标"
    />
  );
}
`;export{e as default};