// 尺寸 | 使用小、中、大三档尺寸
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/react";

const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
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
  );
}
