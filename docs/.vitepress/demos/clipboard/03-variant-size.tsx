// 形态与尺寸 | variant 设置复制按钮的外观，size 分小、中、大三档
import type { ActionVariant, Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/react";

const variants: { label: string; value: ActionVariant }[] = [
  { label: "实心", value: "solid" },
  { label: "浅色", value: "subtle" },
  { label: "线框", value: "outline" },
  { label: "幽灵", value: "ghost" },
];

const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {variants.map(variant => (
          <XhClipboardRoot key={variant.value} value="XiHan.UI" variant={variant.value}>
            <XhClipboardCopyTrigger>
              <XhClipboardIndicator>{variant.label}</XhClipboardIndicator>
              <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
            </XhClipboardCopyTrigger>
          </XhClipboardRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--xh-space-3)" }}>
        {sizes.map(size => (
          <XhClipboardRoot key={size} value="pnpm add @xihan-ui/react" size={size}>
            <XhClipboardControl>
              <XhClipboardInput />
              <XhClipboardCopyTrigger>
                <XhClipboardIndicator>复制</XhClipboardIndicator>
                <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
              </XhClipboardCopyTrigger>
            </XhClipboardControl>
          </XhClipboardRoot>
        ))}
      </div>
    </div>
  );
}
