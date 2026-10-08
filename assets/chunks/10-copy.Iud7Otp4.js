var e=`// 复制全部 | 日志旁放一颗剪贴板按钮复制整段输出；带 ANSI 转义的原文先用 stripAnsi 去掉转义，复制出去的是纯文字
import type { ReactNode } from "react";
import { stripAnsi } from "@xihan-ui/headless";
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import {
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardRoot,
  XhIcon,
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
} from "@xihan-ui/react";

const ESC = "\\u001B";
const lines = [
  \`\${ESC}[2m$ pnpm test\${ESC}[0m\`,
  \`\${ESC}[32m✓\${ESC}[0m tests/order.spec.ts (12 tests)\`,
  \`\${ESC}[31m✗\${ESC}[0m tests/payment.spec.ts > 超时重试 \${ESC}[1;31mFAILED\${ESC}[0m\`,
  \`Tests  \${ESC}[1;31m1 failed\${ESC}[0m | \${ESC}[32m12 passed\${ESC}[0m (13)\`,
];
const text = lines.map(stripAnsi).join("\\n");

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "8px", inlineSize: "100%" }}>
      <XhClipboardRoot value={text}>
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>
            <XhIcon icon={ClipboardIcon} />
            {" "}
            复制全部
          </XhClipboardIndicator>
          <XhClipboardIndicator copied>
            <XhIcon icon={CheckIcon} />
            {" "}
            已复制
          </XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardRoot>
      <XhLogRoot rows={4}>
        <XhLogViewport>
          <XhLogContent>
            {lines.map((line, i) => <XhLogLine key={i} ansi={line} />)}
          </XhLogContent>
        </XhLogViewport>
      </XhLogRoot>
    </div>
  );
}
`;export{e as default};