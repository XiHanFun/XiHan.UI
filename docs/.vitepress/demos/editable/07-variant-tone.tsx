// 变体 | 设置编辑框外观
import type { ReactNode } from "react";
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/react";

const rows = [
  { variant: "outline", label: "描边" },
  { variant: "subtle", label: "浅色" },
  { variant: "ghost", label: "幽灵" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rows.map(row => (
        <XhEditableRoot
          key={row.label}
          variant={row.variant}
          defaultValue="曦寒"
          placeholder="未填写"
        >
          <XhEditableLabel>{row.label}</XhEditableLabel>
          <XhEditableControl>
            <XhEditablePreview />
            <XhEditableInput />
            <XhEditableEditTrigger aria-label="编辑" />
            <XhEditableSubmitTrigger aria-label="确认" />
            <XhEditableCancelTrigger aria-label="取消" />
          </XhEditableControl>
        </XhEditableRoot>
      ))}
    </div>
  );
}
