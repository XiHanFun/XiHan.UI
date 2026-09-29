const n=`// 按值着色 | color 把第三个量映射到顺序色阶，图例末尾多一条色阶；palette 把色阶换到别的色相上
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

// 一片区域里 60 个监测点的位置与 PM2.5 读数，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const stations = Array.from({ length: 60 }, (_, i) => {
  const east = Math.round(noise(i) * 100);
  const north = Math.round(noise(i + 60) * 100);
  const pm = Math.round(20 + (east + north) * 0.6 + noise(i + 120) * 30);
  return { east, north, pm };
});

const series = [{ mark: "scatter", x: "east", y: "north", color: "pm", name: "监测点" }] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={stations}
      series={series}
      palette="teal"
      xAxis={{ title: "向东（千米）" }}
      yAxis={{ title: "向北（千米）" }}
      translations={{ colorLabel: "PM2.5" }}
      caption="各监测点的 PM2.5"
    />
  );
}
`;export{n as default};
