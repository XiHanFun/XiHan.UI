const n=`// 自定义展开图标 | indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画
import type { ReactNode } from "react";
import { MinusIcon, PlusIcon } from "@xihan-ui/icons";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhIcon,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "shipping", label: "配送方式", body: "同城次日达，跨省三日达。" },
  { value: "invoice", label: "发票", body: "支持电子普票与专票。" },
  { value: "refund", label: "退换货", body: "签收七日内无理由退换。" },
];

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
                {/* 标记按这一项在不在展开集合里切换图标 */}
                <XhIcon
                  icon={panels.includes(item.value) ? MinusIcon : PlusIcon}
                  size="sm"
                  style={{ color: "var(--xh-fg-muted)" }}
                />
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
