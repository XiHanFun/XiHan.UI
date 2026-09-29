const n=`// 下钻 | onDatumPress 接住点下的那根柱（Enter / Space 同样）：换成这个地区按月的数据，旁边放一个按钮回到全部地区
import type { ChartDatumDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhButton, XhCartesianChartRoot } from "@xihan-ui/react";
import { useState } from "react";

const regions = [
  { region: "华东", amount: 4820 },
  { region: "华南", amount: 3960 },
  { region: "华北", amount: 3120 },
  { region: "西部", amount: 1780 },
];
const months = ["一月", "二月", "三月", "四月", "五月", "六月"];

// 一个地区六个月的销售额：按地区合计与月份算出，每次打开都一样
function monthsOf(region: string): { month: string; amount: number }[] {
  const total = regions.find(r => r.region === region)!.amount;
  return months.map((month, i) => ({ month, amount: Math.round(total / 6 * (0.8 + 0.08 * i)) }));
}

export default function Demo(): ReactNode {
  // null 是全部地区；点下一根柱就换成那个地区
  const [region, setRegion] = useState<string | null>(null);

  function drill(details: ChartDatumDetails): void {
    if (!region)
      setRegion(String(details.key));
  }

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start", width: "100%" }}>
      <XhButton variant="subtle" disabled={!region} onClick={() => setRegion(null)}>返回全部地区</XhButton>
      <XhCartesianChartRoot
        data={region ? monthsOf(region) : regions}
        series={region
          ? [{ mark: "bar", x: "month", y: "amount", name: \`\${region}销售额\` }]
          : [{ mark: "bar", x: "region", y: "amount", name: "销售额" }]}
        onDatumPress={drill}
        caption={region ? \`\${region} · 按月\` : "各地区销售额（点一根柱查看按月）"}
        style={{ width: "100%" }}
      />
    </div>
  );
}
`;export{n as default};
