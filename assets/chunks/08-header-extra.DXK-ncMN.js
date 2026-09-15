const n=`// 标题栏附加信息 | 标题栏里的节点全归作者，把计数与指示器包成一组排在末尾
import type { ReactNode } from "react";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/react";

const groups = [
  { value: "todo", label: "待处理", extra: "3 项", body: "还没有人认领。" },
  { value: "doing", label: "进行中", extra: "1 项", body: "预计今天完成。" },
  { value: "done", label: "已完成", extra: "12 项", body: "本周已归档。" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot defaultValue={["todo"]}>
        {groups.map(g => (
          <XhAccordionItem key={g.value} value={g.value}>
            <XhAccordionHeader>
              <XhAccordionTrigger>
                <span>{g.label}</span>
                {/* 附加信息与指示器同属末尾这一组，标题栏两端对齐照旧生效 */}
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                  <span>{g.extra}</span>
                  <XhAccordionIndicator />
                </span>
              </XhAccordionTrigger>
            </XhAccordionHeader>
            <XhAccordionContent>{g.body}</XhAccordionContent>
          </XhAccordionItem>
        ))}
      </XhAccordionRoot>
    </div>
  );
}
`;export{n as default};
