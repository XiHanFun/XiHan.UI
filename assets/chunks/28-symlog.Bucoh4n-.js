var e=`// 对称对数轴 | yAxis.scale 写 symlog：长尾数据跨越正负、含 0 也画得出，0 附近铺得开、尾部压得住；还有 sqrt 与 pow（指数写 exponent）
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

const changes = [
  { store: "华北", delta: -1800 },
  { store: "华东", delta: -40 },
  { store: "华中", delta: 0 },
  { store: "华南", delta: 12 },
  { store: "西南", delta: 260 },
  { store: "西北", delta: 9600 },
];

const series = [{ mark: "bar", x: "store", y: "delta", name: "库存变化" }] as const;

// 对称对数：线性轴上 9600 会把其余几根压成一条线，对数轴又画不了负数与 0
const yAxis = { scale: "symlog" } as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={changes}
      series={series}
      yAxis={yAxis}
      caption="各仓库本周库存变化（件）"
    />
  );
}
`;export{e as default};