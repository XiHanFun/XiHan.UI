// 禁用标签 | 保留暂不可用的内容入口
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="active">
      <XhTabsList aria-label="标签状态">
        <XhTabsTrigger value="active">当前</XhTabsTrigger>
        <XhTabsTrigger value="disabled" disabled>不可用</XhTabsTrigger>
        <XhTabsTrigger value="available">可用</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="active">当前标签可以正常切换。</XhTabsContent>
      <XhTabsContent value="disabled">此内容暂不可用。</XhTabsContent>
      <XhTabsContent value="available">此标签可以选择。</XhTabsContent>
    </XhTabsRoot>
  );
}
