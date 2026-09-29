const n=`// 股票 K 线 + 成交量 | 两张图接到同一份缩放窗口与激活键上联动；成交量按开收涨跌取色，数值轴写同样的 minSize 让两张图的绘图区左边对齐
import type { CartesianWindow, ChartKey } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";
import { useState } from "react";

// 一年的交易日：跳过周末，按类目等距排开；开高低收与成交量由日序号算出，每次打开都长一样
const days: { day: string; open: number; high: number; low: number; close: number; volume: number }[] = [];
let close = 32;
for (let i = 0; days.length < 240; i++) {
  const date = new Date(Date.UTC(2025, 9, 1 + i));
  if (date.getUTCDay() === 0 || date.getUTCDay() === 6)
    continue;
  const open = close;
  close = Math.round((open + Math.sin(i / 5) * 0.9 + Math.sin(i / 23) * 0.6 + 0.05) * 100) / 100;
  const swing = 0.3 + Math.abs(Math.sin(i * 1.7)) * 0.8;
  days.push({
    day: \`\${date.getUTCMonth() + 1}/\${date.getUTCDate()}\`,
    open,
    high: Math.round((Math.max(open, close) + swing) * 100) / 100,
    low: Math.round((Math.min(open, close) - swing) * 100) / 100,
    close,
    volume: Math.round(80000 + Math.abs(close - open) * 60000 + Math.abs(Math.sin(i / 3)) * 40000),
  });
}

const candles = [{ mark: "candlestick", x: "day", open: "open", high: "high", low: "low", close: "close", name: "示例股份" }] as const;
const volume = [{ mark: "bar", x: "day", y: "volume", name: "成交量", trend: ["open", "close"] }] as const;
// 价格铺满窗口；两根数值轴同样宽，十字准线在两张图上是同一条竖线
const valueAxis = { fit: "window", minSize: 64 } as const;

export default function Demo(): ReactNode {
  // 两张图共用窗口与激活键：缩放、平移、悬停与键盘在哪张图上做，另一张都跟着走
  const [range, setRange] = useState<CartesianWindow>({ x: [days[180]!.day, days[239]!.day], y: null });
  const [activeKey, setActiveKey] = useState<ChartKey | null>(null);
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)", width: "100%" }}>
      <XhCartesianChartRoot
        data={days}
        series={candles}
        yAxis={valueAxis}
        zoom="x"
        window={range}
        onWindowChange={details => setRange(details.window)}
        activeKey={activeKey}
        onActiveKeyChange={details => setActiveKey(details.activeKey)}
        caption="示例股份 · 日 K"
      />
      <XhCartesianChartRoot
        data={days}
        series={volume}
        yAxis={valueAxis}
        zoom="x"
        window={range}
        onWindowChange={details => setRange(details.window)}
        activeKey={activeKey}
        onActiveKeyChange={details => setActiveKey(details.activeKey)}
        caption="成交量"
      />
    </div>
  );
}
`;export{n as default};
