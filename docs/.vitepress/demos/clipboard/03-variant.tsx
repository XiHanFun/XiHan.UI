// 变体 | 设置复制按钮的外观
import type { ActionVariant } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot } from "@xihan-ui/react";

const variants: { label: string; value: ActionVariant }[] = [
  { label: "实心", value: "solid" },
  { label: "浅色", value: "subtle" },
  { label: "线框", value: "outline" },
  { label: "幽灵", value: "ghost" },
];

export default function Demo(): ReactNode {
  return variants.map(variant => (
    <XhClipboardRoot key={variant.value} value="XiHan.UI" variant={variant.value}>
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator>{variant.label}</XhClipboardIndicator>
        <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardRoot>
  ));
}
