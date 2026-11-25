// 形态、语气、尺寸与状态 | variant 只改变皮肤使用颜色的方式，tone 决定使用哪族颜色，两者正交，加减与键盘行为各档一致；size 让输入框高度与加减按钮一起换档；禁用与只读都不可修改值，禁用还会把加减按钮一并关闭、值也不再随表单提交
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
        {variants.map(v => (
          <XhNumberFieldRoot key={v} variant={v} defaultValue="1">
            <XhNumberFieldLabel>{v}</XhNumberFieldLabel>
            <XhNumberFieldControl>
              <XhNumberFieldDecrementTrigger />
              <XhNumberFieldInput />
              <XhNumberFieldIncrementTrigger />
            </XhNumberFieldControl>
          </XhNumberFieldRoot>
        ))}
      </div>

      {/* 语气这一行固定 outline，只看语气的差别 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
        {tones.map(t => (
          <XhNumberFieldRoot key={t} variant="outline" tone={t} defaultValue="1">
            <XhNumberFieldLabel>{t}</XhNumberFieldLabel>
            <XhNumberFieldControl>
              <XhNumberFieldDecrementTrigger />
              <XhNumberFieldInput />
              <XhNumberFieldIncrementTrigger />
            </XhNumberFieldControl>
          </XhNumberFieldRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--xh-space-4)" }}>
        {sizes.map(s => (
          <XhNumberFieldRoot key={s.label} size={s.size} defaultValue="1">
            <XhNumberFieldLabel>{s.label}</XhNumberFieldLabel>
            <XhNumberFieldControl>
              <XhNumberFieldDecrementTrigger />
              <XhNumberFieldInput />
              <XhNumberFieldIncrementTrigger />
            </XhNumberFieldControl>
          </XhNumberFieldRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
        <XhNumberFieldRoot defaultValue="5" disabled>
          <XhNumberFieldLabel>禁用</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldInput />
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
        </XhNumberFieldRoot>

        <XhNumberFieldRoot defaultValue="5" readOnly>
          <XhNumberFieldLabel>只读</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldInput />
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
        </XhNumberFieldRoot>
      </div>
    </div>
  );
}
