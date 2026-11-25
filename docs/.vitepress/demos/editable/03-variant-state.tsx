// 形态与状态 | variant 设置编辑框外观；禁用、只读与空值占位各是一种状态
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

const variants = [
  { variant: "outline", label: "描边" },
  { variant: "subtle", label: "浅色" },
  { variant: "ghost", label: "幽灵" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-3)" }}>
        {variants.map(row => (
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

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-3)" }}>
        <XhEditableRoot defaultValue="改不动" placeholder="未填写" disabled>
          <XhEditableLabel>禁用</XhEditableLabel>
          <XhEditableControl>
            <XhEditablePreview />
            <XhEditableInput />
            <XhEditableEditTrigger aria-label="编辑" />
            <XhEditableSubmitTrigger aria-label="确认" />
            <XhEditableCancelTrigger aria-label="取消" />
          </XhEditableControl>
        </XhEditableRoot>

        <XhEditableRoot defaultValue="只能看" placeholder="未填写" readOnly>
          <XhEditableLabel>只读</XhEditableLabel>
          <XhEditableControl>
            <XhEditablePreview />
            <XhEditableInput />
            <XhEditableEditTrigger aria-label="编辑" />
            <XhEditableSubmitTrigger aria-label="确认" />
            <XhEditableCancelTrigger aria-label="取消" />
          </XhEditableControl>
        </XhEditableRoot>

        <XhEditableRoot placeholder="未填写">
          <XhEditableLabel>空值占位</XhEditableLabel>
          <XhEditableControl>
            <XhEditablePreview />
            <XhEditableInput />
            <XhEditableEditTrigger aria-label="编辑" />
            <XhEditableSubmitTrigger aria-label="确认" />
            <XhEditableCancelTrigger aria-label="取消" />
          </XhEditableControl>
        </XhEditableRoot>
      </div>
    </div>
  );
}
