// 标签栏摆在哪一边 | root 按书写顺序渲染子节点：把面板写在 list 前面，标签栏就落到内容之后，基线换到另一边
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", inlineSize: "100%" }}>
      <div>
        <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>标签在下</div>
        <XhTabsRoot defaultValue="overview" style={{ inlineSize: "100%" }}>
          {tabs.map(t => (
            <XhTabsContent key={t.value} value={t.value}>
              {`${t.label} 的面板`}
            </XhTabsContent>
          ))}
          {/* 基线跟着换边：横排的基线在 list 底边，标签在下就把它挪到顶边 */}
          <XhTabsList
            style={{
              borderBlockEnd: 0,
              borderBlockStart: "var(--xh-stroke-thin) solid var(--xh-border-default)",
            }}
          >
            {tabs.map(t => (
              <XhTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </XhTabsTrigger>
            ))}
          </XhTabsList>
        </XhTabsRoot>
      </div>

      <div>
        <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>标签在右</div>
        <XhTabsRoot
          defaultValue="overview"
          orientation="vertical"
          style={{ inlineSize: "100%" }}
        >
          {tabs.map(t => (
            <XhTabsContent key={t.value} value={t.value} style={{ flex: 1 }}>
              {`${t.label} 的面板`}
            </XhTabsContent>
          ))}
          <XhTabsList
            style={{
              borderInlineEnd: 0,
              borderInlineStart: "var(--xh-stroke-thin) solid var(--xh-border-default)",
            }}
          >
            {tabs.map(t => (
              <XhTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </XhTabsTrigger>
            ))}
          </XhTabsList>
        </XhTabsRoot>
      </div>
    </div>
  );
}
