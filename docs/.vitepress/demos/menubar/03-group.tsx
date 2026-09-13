/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分组 | 在菜单内组织相关命令
import type { ReactNode } from "react";
import {
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenubarRoot style={{ background: "var(--xh-bg-subtle)" }}>
      <XhMenubarTrigger value="view">视图</XhMenubarTrigger>
      <XhMenubarPositioner value="view">
        <XhMenubarContent>
          <XhMenubarGroup value="theme">
            <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
            <XhMenubarItem value="light">
              <XhMenubarItemIndicator />
              <XhMenubarItemText>浅色</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="dark"><XhMenubarItemText>深色</XhMenubarItemText></XhMenubarItem>
          </XhMenubarGroup>
          <XhMenubarSeparator />
          <XhMenubarGroup value="panels">
            <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
            <XhMenubarItem value="sidebar"><XhMenubarItemText>侧栏</XhMenubarItemText></XhMenubarItem>
            <XhMenubarItem value="terminal"><XhMenubarItemText>终端</XhMenubarItemText></XhMenubarItem>
          </XhMenubarGroup>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>
  );
}
