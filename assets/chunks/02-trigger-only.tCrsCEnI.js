const o=`// 只要一颗按钮 | 必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉
import type { ReactNode } from "react";
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot } from "@xihan-ui/react";

const install = "pnpm add @xihan-ui/react @xihan-ui/styles";

export default function Demo(): ReactNode {
  return (
    <>
      <code style={{ fontSize: "13px" }}>{install}</code>
      <XhClipboardRoot value={install} timeout={1500}>
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>复制安装命令</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardRoot>
    </>
  );
}
`;export{o as default};
