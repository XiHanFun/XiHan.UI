// 语气、尺寸与状态 | tone 决定勾中后方框使用哪族颜色，因此这一行都设为勾中；size 适配不同的界面密度；disabled、readOnly 与 invalid 分别标出不可用、不可修改与必须处理
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)", flexWrap: "wrap" }}>
        {tones.map(t => (
          <XhCheckbox key={t} tone={t} defaultChecked>{t}</XhCheckbox>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)" }}>
        <XhCheckbox size="sm" defaultChecked>小</XhCheckbox>
        <XhCheckbox defaultChecked>中</XhCheckbox>
        <XhCheckbox size="lg" defaultChecked>大</XhCheckbox>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)", flexWrap: "wrap" }}>
        <XhCheckbox disabled>禁用</XhCheckbox>
        <XhCheckbox defaultChecked disabled>已选中且禁用</XhCheckbox>
        <XhCheckbox defaultChecked readOnly>只读</XhCheckbox>
        <XhCheckbox invalid required>我同意服务条款</XhCheckbox>
      </div>
    </div>
  );
}
