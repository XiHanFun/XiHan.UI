// 标签带在下方 | placement 设为 end 时标签带排到面板之后，读屏与 Tab 序照旧先到标签带
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
    <XhTabsRoot defaultValue="preview" placement="end" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="查看方式">
        <XhTabsTrigger value="preview">预览</XhTabsTrigger>
        <XhTabsTrigger value="source">源码</XhTabsTrigger>
        <XhTabsTrigger value="history">历史</XhTabsTrigger>
        <XhTabsIndicator />
      </XhTabsList>

      <XhTabsContent value="preview">页面渲染后的样子。</XhTabsContent>
      <XhTabsContent value="source">页面的源码。</XhTabsContent>
      <XhTabsContent value="history">页面的修改记录。</XhTabsContent>
    </XhTabsRoot>
  );
}
