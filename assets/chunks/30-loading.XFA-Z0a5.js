const n=`// 加载态 | pending 表示正在取数：首次还没有数据时空态写「加载中」并转圈，之后重取时保留上一帧、整体变淡，取回来再过渡到新值
import type { ReactNode } from "react";
import { XhButton, XhCartesianChartRoot } from "@xihan-ui/react";
import { useEffect, useState } from "react";

// 两批数据轮流取回，模拟每次刷新拿到的新结果
const batches = [
  [
    { month: "一月", amount: 1204 },
    { month: "二月", amount: 986 },
    { month: "三月", amount: 1530 },
    { month: "四月", amount: 1382 },
    { month: "五月", amount: 1745 },
    { month: "六月", amount: 1618 },
  ],
  [
    { month: "一月", amount: 1310 },
    { month: "二月", amount: 1120 },
    { month: "三月", amount: 1480 },
    { month: "四月", amount: 1600 },
    { month: "五月", amount: 1705 },
    { month: "六月", amount: 1890 },
  ],
];

const series = [{ mark: "bar", x: "month", y: "amount", name: "销售额" }] as const;

export default function Demo(): ReactNode {
  const [data, setData] = useState<{ month: string; amount: number }[]>([]);
  const [pending, setPending] = useState(true);
  const [turn, setTurn] = useState(0);

  // pending 一打开就去取：取回来换上数据、关掉 pending
  useEffect(() => {
    if (!pending)
      return;
    const timer = setTimeout(() => {
      setData(batches[turn % batches.length]!);
      setTurn(turn + 1);
      setPending(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pending, turn]);

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start", width: "100%" }}>
      <XhButton variant="subtle" disabled={pending} onClick={() => setPending(true)}>刷新</XhButton>
      <XhCartesianChartRoot
        data={data}
        series={series}
        pending={pending}
        caption="月度销售额"
        style={{ width: "100%" }}
      />
    </div>
  );
}
`;export{n as default};
