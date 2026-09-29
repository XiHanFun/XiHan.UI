const n=`// 画布渲染 | 两万个点超过节点预算，数据层自动画在画布上；坐标轴、提示框、图例与键盘照常
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

// 两个机房各一万次请求：当时的并发数与响应时间，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const requests = Array.from({ length: 20000 }, (_, i) => {
  const load = Math.round(noise(i) * 800);
  const latency = Math.round(20 + load * (i % 2 ? 0.12 : 0.08) + noise(i + 7) ** 3 * 180);
  return i % 2 ? { load, south: latency } : { load, north: latency };
});

// renderer 缺省 auto：逐个成节点的点超过 3000 个就改用画布
const series = [
  { mark: "scatter", x: "load", y: "north", name: "北区" },
  { mark: "scatter", x: "load", y: "south", name: "南区" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={requests}
      series={series}
      xAxis={{ title: "并发数" }}
      yAxis={{ title: "响应时间（ms）" }}
      caption="并发与响应时间"
    />
  );
}
`;export{n as default};
