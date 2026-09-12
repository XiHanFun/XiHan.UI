const n=`// 自定义展开图标 | indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画
import type { ReactNode } from "react";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "shipping", label: "配送方式", body: "同城次日达，跨省三日达。" },
  { value: "invoice", label: "发票", body: "支持电子普票与专票。" },
  { value: "refund", label: "退换货", body: "签收七日内无理由退换。" },
];

const markStyle = { fontSize: "12px", color: "var(--xh-fg-muted)" };

export default function Demo(): ReactNode {
  const [panels, setPanels] = useState<string[]>(["shipping"]);

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot
        value={panels}
        onValueChange={details => setPanels(details.value)}
        multiple
      >
        {items.map(item => (
          <XhAccordionItem key={item.value} value={item.value}>
            <XhAccordionHeader>
              <XhAccordionTrigger>
                <span>{item.label}</span>
                {/* 标记按这一项在不在展开集合里换字形 */}
                <span style={markStyle}>
                  {panels.includes(item.value) ? "－" : "＋"}
                </span>
              </XhAccordionTrigger>
            </XhAccordionHeader>
            <XhAccordionContent>{item.body}</XhAccordionContent>
          </XhAccordionItem>
        ))}
      </XhAccordionRoot>
    </div>
  );
}
`;export{n as default};
