var e=`// 竖排布局与兜底字形 | 写一层输入行，root 即切换为竖排：输入行在上、动作行在下；按钮留空时皮肤按身份绘制箭头或停止方块
import type { PromptInputSubmitKey } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCheckbox,
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhSelectRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const submitKeys = [
  { value: "enter", label: "Enter 提交" },
  { value: "mod-enter", label: "Ctrl/Cmd+Enter 提交" },
  { value: "none", label: "只用按钮提交" },
];

export default function Demo(): ReactNode {
  // 选择器的值恒为数组，单选即长度 1
  const [submitKey, setSubmitKey] = useState<string[]>(["enter"]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  return (
    <>
      <XhPromptInputRoot
        loading={loading}
        submitKey={submitKey[0] as PromptInputSubmitKey}
        translations={{ input: "给助手写点什么" }}
        onSubmit={details => setSent(prev => [...prev, details.value])}
        onStop={() => setLoading(false)}
      >
        {({ value }) => (
          <>
            <XhPromptInputControl>
              <XhPromptInputInput rows={1} placeholder="给助手写点什么…" />
              <XhPromptInputSubmitTrigger />
            </XhPromptInputControl>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
              <XhCheckbox checked={loading} onCheckedChange={details => setLoading(details.checked)} size="sm">
                生成中
              </XhCheckbox>
              <XhSelectRoot
                value={submitKey}
                onValueChange={details => setSubmitKey(details.value)}
                collection={submitKeys}
                size="sm"
              />
              <span style={{ marginInlineStart: "auto" }}>{\`\${value.length} 字\`}</span>
            </div>
          </>
        )}
      </XhPromptInputRoot>
      <p data-demo-output>{\`已发出：\${sent.join(" / ") || "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};