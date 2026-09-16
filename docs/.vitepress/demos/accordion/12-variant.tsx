// 形态 | ghost 不绘制外壳，outline 连成单一表面，subtle 用淡底；三档只改变与页面分开的方式
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const panels = [
  { value: "shipping", label: "配送方式", content: "下单后 48 小时内发出。" },
  { value: "refund", label: "退换政策", content: "签收 7 天内可申请退换。" },
];

const variants = ["ghost", "outline", "subtle"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {variants.map(variant => (
        <XhAccordionRoot
          key={variant}
          variant={variant}
          collection={panels}
          defaultValue={["shipping"]}
        />
      ))}
    </div>
  );
}
