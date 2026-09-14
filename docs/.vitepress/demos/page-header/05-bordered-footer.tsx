// 页脚 | 在标题下方显示页面摘要
import type { ReactNode } from "react";
import { XhButton, XhPageHeaderExtra, XhPageHeaderFooter, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPageHeaderRoot bordered style={{ inlineSize: "min(720px, 100%)" }}>
      <XhPageHeaderTitle>七月账单</XhPageHeaderTitle>
      <XhPageHeaderExtra><XhButton variant="subtle">下载账单</XhButton></XhPageHeaderExtra>
      <XhPageHeaderFooter>7 月 1 日至 7 月 31 日 · 128 笔 · 合计 ¥3,240.00</XhPageHeaderFooter>
    </XhPageHeaderRoot>
  );
}
