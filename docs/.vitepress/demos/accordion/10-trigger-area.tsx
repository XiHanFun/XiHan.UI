// 缩小触发区域 | trigger 只包住指示器，标题文字留在 header 里，点标题不再展开
import type { ReactNode } from "react";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/react";

const items = [
  { value: "profile", label: "账户资料", body: "只有右边那个按钮能展开这一段。" },
  { value: "billing", label: "账单信息", body: "标题文字不在按钮里，点它没有反应。" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot defaultValue={["profile"]}>
        {items.map(item => (
          <XhAccordionItem key={item.value} value={item.value}>
            {/* 标题栏自己排布：文字是普通节点，按钮只占末尾一小格 */}
            <XhAccordionHeader
              style={{ display: "flex", alignItems: "center", gap: "8px", paddingInlineStart: "12px" }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              <XhAccordionTrigger
                style={{ inlineSize: "auto" }}
                aria-label={`展开${item.label}`}
              >
                <XhAccordionIndicator />
              </XhAccordionTrigger>
            </XhAccordionHeader>
            <XhAccordionContent>{item.body}</XhAccordionContent>
          </XhAccordionItem>
        ))}
      </XhAccordionRoot>
    </div>
  );
}
