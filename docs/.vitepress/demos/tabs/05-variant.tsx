// 变体 | 区分主要、次级与卡片式导航
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

const variants = [
  { value: undefined, label: "主要" },
  { value: "line", label: "次级" },
  { value: "card", label: "卡片" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "min(560px, 100%)" }}>
      {variants.map(variant => (
        <div key={variant.label} style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "var(--xh-fg-muted)" }}>{variant.label}</span>
          <XhTabsRoot defaultValue="overview" variant={variant.value}>
            <XhTabsList aria-label={`${variant.label}标签页`}>
              <XhTabsTrigger value="overview">概览</XhTabsTrigger>
              <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
              <XhTabsTrigger value="reports">报告</XhTabsTrigger>
              <XhTabsIndicator />
            </XhTabsList>
            <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
            <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
            <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
          </XhTabsRoot>
        </div>
      ))}
    </div>
  );
}
