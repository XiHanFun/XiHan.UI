// 五档阶段 | 等人批准不是在跑：闸门常驻在开关与详情之间，不会被折叠藏起来
import type { ToolCallPhase } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhToolCallApproval,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/react";

const phases: ToolCallPhase[] = [
  "input-streaming",
  "input-available",
  "awaiting-approval",
  "output-available",
  "output-error",
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {phases.map(phase => (
        <XhToolCallRoot key={phase} phase={phase}>
          <XhToolCallTrigger>
            <XhToolCallIndicator />
            <XhToolCallLabel>search</XhToolCallLabel>
            <XhToolCallStatus />
          </XhToolCallTrigger>
          <XhToolCallApproval>这一步要先经你批准。</XhToolCallApproval>
          <XhToolCallContent>
            <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
          </XhToolCallContent>
        </XhToolCallRoot>
      ))}
    </div>
  );
}
