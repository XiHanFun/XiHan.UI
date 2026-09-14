// 竖排布局与兜底字形 | 写一层输入行，root 就翻成竖排：输入行在上、动作行在下；按钮留空时皮肤按身份画上箭头或停止方块
import type { ReactNode } from "react";
import { XhPromptInputControl, XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [submitKey, setSubmitKey] = useState<"enter" | "mod-enter" | "none">("enter");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <XhPromptInputRoot
        loading={loading}
        submitKey={submitKey}
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
              <label style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="checkbox"
                  checked={loading}
                  onChange={event => setLoading(event.target.checked)}
                />
                生成中
              </label>
              <select
                value={submitKey}
                aria-label="按哪一档提交"
                onChange={event => setSubmitKey(event.target.value as "enter" | "mod-enter" | "none")}
              >
                <option value="enter">Enter 提交</option>
                <option value="mod-enter">Ctrl/Cmd+Enter 提交</option>
                <option value="none">只用按钮提交</option>
              </select>
              <span style={{ marginInlineStart: "auto" }}>{`${value.length} 字`}</span>
            </div>
          </>
        )}
      </XhPromptInputRoot>
      {sent.length ? <p style={{ margin: 0 }}>{`已发出：${sent.join(" / ")}`}</p> : null}
    </div>
  );
}
