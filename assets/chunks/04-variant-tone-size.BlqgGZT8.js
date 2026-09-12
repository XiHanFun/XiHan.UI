const o=`// 形态、语气与尺寸 | 三轴都打在 root 上：变体换复制钮的用色方式，语气换色族，尺寸连输入框一起换档
import type { ReactNode } from "react";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/react";

const apiToken = "xh_live_9f2c7a41b6d84e05";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <XhClipboardRoot value={apiToken} variant="outline">
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>描边</XhClipboardIndicator>
            <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>

      <XhClipboardRoot value={apiToken} variant="ghost" tone="success">
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>幽灵 · 成功</XhClipboardIndicator>
            <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>

      <XhClipboardRoot value={apiToken} size="sm">
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>小档</XhClipboardIndicator>
            <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>

      <XhClipboardRoot value={apiToken} size="lg">
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>大档</XhClipboardIndicator>
            <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>
    </div>
  );
}
`;export{o as default};
