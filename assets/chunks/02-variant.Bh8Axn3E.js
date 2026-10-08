var e=`// 形态 | variant 切换同一组数的画法：line 折线、area 折线下铺一层淡洗、bar 柱
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

const orders = [18, 24, 21, 30, 27, 35, 32, 41];
const variants = ["line", "area", "bar"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-6)" }}>
      {variants.map(v => (
        <XhSparkline key={v} data={orders} variant={v} aria-label={\`近 8 天订单数（\${v}）\`} />
      ))}
    </div>
  );
}
`;export{e as default};