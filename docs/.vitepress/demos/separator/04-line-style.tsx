// 线型、粗细与颜色 | variant 三档换深浅，dashed 画虚线（横竖各自成立），粗细与颜色仍是两个槽位
import type { CSSProperties, ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "10px" }}>
      <span style={{ fontSize: "13px" }}>实线（缺省）</span>
      <XhSeparator decorative />

      <span style={{ fontSize: "13px" }}>弱线 / 强线</span>
      <XhSeparator decorative variant="subtle" />
      <XhSeparator decorative variant="strong" />

      <span style={{ fontSize: "13px" }}>虚线</span>
      <XhSeparator decorative dashed />

      <span style={{ fontSize: "13px" }}>虚线段拉长、空白收窄</span>
      <XhSeparator
        decorative
        dashed
        style={{ "--xh-separator-dash-length": "12px", "--xh-separator-dash-gap": "4px" } as CSSProperties}
      />

      <span style={{ fontSize: "13px" }}>加粗并换色</span>
      <XhSeparator
        decorative
        style={{ "--xh-separator-thickness": "3px", "--xh-separator-color": "var(--xh-color-brand-500)" } as CSSProperties}
      />

      {/* 竖向同样成立：虚线的方向由 data-orientation 决定，不用另写表达式 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "32px" }}>
        <span style={{ fontSize: "13px" }}>左</span>
        <XhSeparator orientation="vertical" decorative dashed />
        <span style={{ fontSize: "13px" }}>右</span>
      </div>
    </div>
  );
}
