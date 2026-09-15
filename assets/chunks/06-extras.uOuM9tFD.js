const t=`// 框里的附加节点 | root 里除三件外还能放自己的按钮与计数；值的读写归宿主，原生属性照旧直接落到输入框上
import type { ReactNode } from "react";
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const max = 40;

export default function Demo(): ReactNode {
  const [log, setLog] = useState("（还没发过）");

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhPromptInputRoot
        defaultValue="输入框两侧各放了一颗自己的按钮"
        translations={{ input: "给助手写点什么" }}
        onSubmit={details => setLog(\`提交：\${details.value}\`)}
      >
        {({ value, setValue }) => (
          <>
            <XhButton variant="ghost" size="sm">附件</XhButton>
            {/* maxlength 是原生属性，直接落到 textarea 上 */}
            <XhPromptInputInput maxLength={max} rows={1} placeholder="最多 40 个字" />
            <span style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{\`\${value.length} / \${max}\`}</span>
            {/* 有内容才给清空，清空后按钮自己转灰 */}
            <XhButton variant="ghost" size="sm" disabled={value === ""} onClick={() => setValue("")}>
              清空
            </XhButton>
            <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
          </>
        )}
      </XhPromptInputRoot>
      <span>{log}</span>
    </div>
  );
}
`;export{t as default};
