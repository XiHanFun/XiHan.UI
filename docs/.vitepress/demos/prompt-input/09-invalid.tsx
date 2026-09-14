// 发送失败的错误态 | 判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报
import type { PromptInputSubmitDetails } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/react";
import { useId, useRef, useState } from "react";

// 边框换成危险档，覆盖的是公开变量
const invalidStyle = { "--xh-prompt-input-border": "var(--xh-color-danger-500)" } as CSSProperties;

export default function Demo(): ReactNode {
  const reasonId = useId();
  const [failed, setFailed] = useState(false);
  const [log, setLog] = useState("（还没发过）");
  const attempt = useRef(0);

  function onSubmit(details: PromptInputSubmitDetails): void {
    attempt.current += 1;
    // 头一条故意发不出去，再发一条就成
    const bad = attempt.current % 2 === 1;
    setFailed(bad);
    setLog(bad ? `没发出去：${details.value}` : `提交：${details.value}`);
  }

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <XhPromptInputRoot
        data-invalid={failed || undefined}
        style={failed ? invalidStyle : undefined}
        translations={{ input: "给助手写点什么" }}
        onSubmit={onSubmit}
      >
        <XhPromptInputInput
          aria-invalid={failed ? "true" : "false"}
          aria-describedby={failed ? reasonId : undefined}
          rows={1}
          placeholder="发一条试试"
        />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>

      {/* 节点常挂、靠 hidden 显隐：翻出来的那一刻读屏把原因念出来 */}
      <p
        id={reasonId}
        role="alert"
        hidden={!failed}
        style={{ margin: 0, fontSize: "13px", color: "var(--xh-fg-danger)" }}
      >
        网络不通，这条没能发出去，再发一次
      </p>
      <span>{log}</span>
    </div>
  );
}
