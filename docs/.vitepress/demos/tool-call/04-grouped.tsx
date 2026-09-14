// 多次调用分组 | 外面套一层手风琴当分组头：计数用等宽数位，整组开合归手风琴，卡片各管各的
import type { ReactNode } from "react";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallSummary,
  XhToolCallTrigger,
} from "@xihan-ui/react";

const calls = [
  { name: "search", summary: "\"折叠动画\"", output: "找到 3 条结果。" },
  { name: "read_file", summary: "src/tool-call.css", output: "读了 214 行。" },
  { name: "apply_patch", summary: "+12 −3 src/tool-call.css", output: "已写入 1 个文件。" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhAccordionRoot defaultValue={["run"]}>
        <XhAccordionItem value="run">
          <XhAccordionHeader>
            <XhAccordionTrigger>
              <span>这一轮跑了的工具</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                {/* 计数用等宽数位：数字变了也不会把指示器推着走 */}
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{`${calls.length} 个`}</span>
                <XhAccordionIndicator />
              </span>
            </XhAccordionTrigger>
          </XhAccordionHeader>
          <XhAccordionContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {calls.map(call => (
                <XhToolCallRoot key={call.name} phase="output-available">
                  <XhToolCallTrigger>
                    <XhToolCallIndicator />
                    <XhToolCallLabel>{call.name}</XhToolCallLabel>
                    <XhToolCallSummary>{call.summary}</XhToolCallSummary>
                    <XhToolCallStatus />
                  </XhToolCallTrigger>
                  <XhToolCallContent>
                    <XhToolCallOutput>{call.output}</XhToolCallOutput>
                  </XhToolCallContent>
                </XhToolCallRoot>
              ))}
            </div>
          </XhAccordionContent>
        </XhAccordionItem>
      </XhAccordionRoot>
    </div>
  );
}
