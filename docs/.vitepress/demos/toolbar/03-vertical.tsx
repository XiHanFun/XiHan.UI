// 竖排 | orientation 决定方向键收哪一对键（另一轴原样放行给页面），分隔线的朝向恒与主轴垂直
import type { CSSProperties, ReactNode } from "react";
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";

const itemStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

export default function Demo(): ReactNode {
  return (
    <XhToolbarRoot orientation="vertical" style={{ inlineSize: "140px" }}>
      <XhToolbarItem value="zoom-in" style={itemStyle}>放大</XhToolbarItem>
      <XhToolbarItem value="zoom-out" style={itemStyle}>缩小</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="fit" style={itemStyle}>适应画布</XhToolbarItem>
    </XhToolbarRoot>
  );
}
