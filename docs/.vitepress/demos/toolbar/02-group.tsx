// 分组 | 分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去
import type { CSSProperties, ReactNode } from "react";
import {
  XhToolbarGroup,
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
    <XhToolbarRoot style={{ inlineSize: "100%" }}>
      <XhToolbarItem value="undo" style={itemStyle}>撤销</XhToolbarItem>
      <XhToolbarItem value="redo" style={itemStyle}>重做</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarGroup>
        <XhToolbarItem value="align-left" style={itemStyle}>左对齐</XhToolbarItem>
        <XhToolbarItem value="align-center" style={itemStyle}>居中</XhToolbarItem>
        <XhToolbarItem value="align-right" style={itemStyle}>右对齐</XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>
  );
}
