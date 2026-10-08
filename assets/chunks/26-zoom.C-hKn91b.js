var e=`// 缩放 | zoom 打开自变量轴的缩放：按住 Ctrl（⌘）滚轮以指针为中心缩放，放大后拖动平移，缩放条拖两端改窗口；点多时按像素降采样
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

// 一整年的日访问量，由日序号算出，每次打开都长一样
const visits = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(2026, 0, 1 + i),
  visits: Math.round(3200 + i * 6 + Math.sin(i / 7) * 420 + Math.sin(i / 29) * 650),
}));

const series = [{ mark: "line", x: "date", y: "visits", name: "访问量", symbols: "none" }] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={visits}
      series={series}
      zoom="x"
      caption="全年日访问量"
    />
  );
}
`;export{e as default};