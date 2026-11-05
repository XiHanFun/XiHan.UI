// 指示器在后 | 缺省的箭头排在标题之前；指示器写在标题之后即落到行尾
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
  { value: "one", label: "第一章", body: "指示器在行尾，展开时照样转向。" },
  { value: "two", label: "第二章", body: "部件的先后顺序就是它们在标题栏里的顺序。" },
  { value: "three", label: "第三章", body: "余量落在标题与指示器之间。" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot defaultValue={["one"]}>
        {items.map(item => (
          <XhAccordionItem key={item.value} value={item.value}>
            <XhAccordionHeader>
              <XhAccordionTrigger>
                <span>{item.label}</span>
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
