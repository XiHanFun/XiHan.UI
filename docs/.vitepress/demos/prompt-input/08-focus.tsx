// 聚焦与选中 | 输入部件就是一个原生 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条
import type { PromptInputSubmitDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [log, setLog] = useState("（还没发过）");
  // 组件渲染的就是一个原生 textarea，ref 直接落在它身上
  const input = useRef<HTMLTextAreaElement>(null);

  function onSubmit(details: PromptInputSubmitDetails): void {
    setLog(`提交：${details.value}`);
    // 点发送按钮会把焦点留在按钮上，这里送回输入框
    input.current?.focus();
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhPromptInputRoot translations={{ input: "给助手写点什么" }} onSubmit={onSubmit}>
        <XhPromptInputInput ref={input} rows={1} placeholder="发一条，焦点会自己回来" />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton variant="outline" size="sm" onClick={() => input.current?.focus()}>聚焦</XhButton>
        <XhButton variant="outline" size="sm" onClick={() => input.current?.select()}>全选</XhButton>
        <XhButton variant="ghost" size="sm" onClick={() => input.current?.blur()}>失焦</XhButton>
      </div>
      <span>{log}</span>
    </div>
  );
}
