// 形态 | surface 让工具条自己画一块面，plain 不画：贴在编辑区顶上时用 plain，浮在内容之上时用 surface
import type { CSSProperties, ReactNode } from "react";
import { XhToolbarItem, XhToolbarRoot, XhToolbarSeparator } from "@xihan-ui/react";

const itemStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span>surface（缺省）</span>
        <XhToolbarRoot variant="surface">
          <XhToolbarItem value="surface-bold" style={itemStyle}>粗体</XhToolbarItem>
          <XhToolbarItem value="surface-italic" style={itemStyle}>斜体</XhToolbarItem>
          <XhToolbarSeparator />
          <XhToolbarItem value="surface-link" style={itemStyle}>链接</XhToolbarItem>
        </XhToolbarRoot>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span>plain</span>
        <XhToolbarRoot variant="plain">
          <XhToolbarItem value="plain-bold" style={itemStyle}>粗体</XhToolbarItem>
          <XhToolbarItem value="plain-italic" style={itemStyle}>斜体</XhToolbarItem>
          <XhToolbarSeparator />
          <XhToolbarItem value="plain-link" style={itemStyle}>链接</XhToolbarItem>
        </XhToolbarRoot>
      </div>
    </div>
  );
}
