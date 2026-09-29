const n=`// 类目上的分布 | 散点落在类目轴上时用 jitter 左右散开，看每个类目里的点怎么分布，而不是叠成一条竖线
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

// 一周五天、每天 16 次接口的响应时间，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const days = ["周一", "周二", "周三", "周四", "周五"];
const samples = days.flatMap((day, d) =>
  Array.from({ length: 16 }, (_, i) => ({
    day,
    ms: Math.round(120 + d * 18 + noise(d * 16 + i) ** 2 * 260),
  })),
);

const series = [{ mark: "scatter", x: "day", y: "ms", name: "响应时间", jitter: 0.6 }] as const;

export default function Demo(): ReactNode {
  return <XhCartesianChartRoot data={samples} series={series} yAxis={{ title: "毫秒" }} caption="各天的接口响应时间" />;
}
`;export{n as default};
