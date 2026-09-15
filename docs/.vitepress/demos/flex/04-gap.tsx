// 间距 | 使用预设间距
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="md">
      {groups.map(group => (
        <XhFlex key={group.gap} align="center" gap="md">
          <span style={{ inlineSize: "48px", color: "var(--xh-fg-muted)" }}>{group.label}</span>
          <XhFlex gap={group.gap}>
            {[1, 2, 3].map(item => <span key={item} data-demo-block="square" data-tone="brand" style={{ inlineSize: "28px", blockSize: "28px" }} />)}
          </XhFlex>
        </XhFlex>
      ))}
    </XhFlex>
  );
}
