const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 跨列与错列 | 控制内容占用的列
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const itemStyle: CSSProperties = {
  padding: "16px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={4} gap="sm" style={{ inlineSize: "min(640px, 100%)" }}>
      <XhGridItem span={3} style={itemStyle}>项目概览</XhGridItem>
      <XhGridItem style={itemStyle}>动态</XhGridItem>
      <XhGridItem span={2} style={itemStyle}>任务</XhGridItem>
      <XhGridItem span={2} style={itemStyle}>成员</XhGridItem>
      <XhGridItem offset={1} span={2} style={{ ...itemStyle, background: "var(--xh-bg-brand-subtle)", color: "var(--xh-fg-brand)" }}>居中区域</XhGridItem>
    </XhGridRoot>
  );
}
`;export{e as default};
