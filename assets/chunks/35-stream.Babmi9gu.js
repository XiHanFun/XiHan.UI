const e=`// 实时行情流 | 列式数据仓 append 新成交，同一帧里的多次推送合成一次重画；窗口跟着最新价走，拖离末端即暂停，受控的 follow 一键回到最新
import type { ColumnStore } from "@xihan-ui/react";
import type { ReactNode } from "react";
import { createColumnStore, XhButton, XhCartesianChartRoot } from "@xihan-ui/react";
import { useEffect, useState } from "react";

interface Market {
  readonly trades: ColumnStore;
  readonly trade: () => void;
  readonly recent: { x: [Date, Date]; y: null };
}

// 最多留两万笔成交，更早的从头部挤掉；价格是确定的随机游走，每次打开都长一样
function createMarket(): Market {
  const trades = createColumnStore({ fields: ["t", "price"], capacity: 20000 });
  let seed = 7;
  let price = 62000;
  let time = Date.UTC(2026, 8, 1);
  const trade = (): void => {
    seed = (seed * 16807) % 2147483647;
    price += (seed / 2147483647 - 0.5) * 40;
    time += 500;
    trades.append({ t: time, price });
  };
  for (let i = 0; i < 5000; i++)
    trade();
  // 初始窗口是最近十分钟
  return { trades, trade, recent: { x: [new Date(time - 10 * 60_000), new Date(time)], y: null } };
}

const series = [{ mark: "line", x: "t", y: "price", name: "BTC/USDT" }] as const;
const annotations = [{ kind: "point", series: "price", at: "last" }] as const;

export default function Demo(): ReactNode {
  const [market] = useState(createMarket);
  // 拖动、滚轮或键盘让窗口离开末端时 follow 变 false
  const [follow, setFollow] = useState(true);
  // 每 100 ms 到五笔：图表按帧合并，不是每笔重画一次
  useEffect(() => {
    const timer = setInterval(() => {
      for (let i = 0; i < 5; i++)
        market.trade();
    }, 100);
    return () => clearInterval(timer);
  }, [market]);
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start", width: "100%" }}>
      <XhButton variant="subtle" disabled={follow} onClick={() => setFollow(true)}>回到最新</XhButton>
      <XhCartesianChartRoot
        data={market.trades}
        series={series}
        xAxis={{ scale: "time" }}
        yAxis={{ fit: "window" }}
        annotations={annotations}
        defaultWindow={market.recent}
        zoom="x"
        follow={follow}
        onFollowChange={details => setFollow(details.follow)}
        style={{ width: "100%" }}
        caption="BTC/USDT 逐笔成交"
      />
    </div>
  );
}
`;export{e as default};
