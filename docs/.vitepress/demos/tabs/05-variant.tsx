// 次级变体 | 使用下划线表示当前标签
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="overview" variant="line" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="数据视图">
        <XhTabsTrigger value="overview">概览</XhTabsTrigger>
        <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
        <XhTabsTrigger value="reports">报告</XhTabsTrigger>
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
      <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
      <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
    </XhTabsRoot>
  );
}
