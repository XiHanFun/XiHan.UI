// 分组与标记位 | group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位
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
import { useState } from "react";

export default function Demo(): ReactNode {
  const [theme, setTheme] = useState("light");

  function onSelect(details: { menu: string; value: string }): void {
    if (details.menu === "view")
      setTheme(details.value);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhMenubarRoot onSelect={onSelect}>
        <XhMenubarTrigger value="view">视图</XhMenubarTrigger>

        <XhMenubarPositioner value="view">
          <XhMenubarContent>
            <XhMenubarGroup value="theme">
              <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
              <XhMenubarItem value="light">
                <XhMenubarItemIndicator
                  style={{ visibility: theme === "light" ? "visible" : "hidden" }}
                />
                <XhMenubarItemText>浅色</XhMenubarItemText>
              </XhMenubarItem>
              <XhMenubarItem value="dark">
                <XhMenubarItemIndicator
                  style={{ visibility: theme === "dark" ? "visible" : "hidden" }}
                />
                <XhMenubarItemText>深色</XhMenubarItemText>
              </XhMenubarItem>
            </XhMenubarGroup>

            <XhMenubarSeparator />

            <XhMenubarGroup value="panel">
              <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
              <XhMenubarItem value="sidebar">
                <XhMenubarItemText>侧栏</XhMenubarItemText>
              </XhMenubarItem>
              <XhMenubarItem value="terminal">
                <XhMenubarItemText>终端</XhMenubarItemText>
              </XhMenubarItem>
            </XhMenubarGroup>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>

      <span>{`当前主题：${theme === "light" ? "浅色" : "深色"}`}</span>
    </div>
  );
}
