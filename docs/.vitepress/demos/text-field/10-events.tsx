// 事件 | 值的变化走组件的 value-change，聚焦失焦这类原生事件直接写在 input 部件上
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [log, setLog] = useState<string[]>([]);

  // 新的排在最前，只留最近三条
  function push(text: string): void {
    setLog(prev => [text, ...prev].slice(0, 3));
  }

  function onValueChange(details: { value: string }): void {
    push(`value-change：${details.value || "（空）"}`);
  }

  return (
    <>
      <XhTextFieldRoot placeholder="随便敲几个字" clearable onValueChange={onValueChange}>
        <XhTextFieldLabel>留言</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "220px" }}>
          <XhTextFieldInput onFocus={() => push("focus")} onBlur={() => push("blur")} />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      {log.length
        ? (
            <ol style={{ margin: 0, paddingInlineStart: "20px" }}>
              {log.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          )
        : <span>还没有事件</span>}
    </>
  );
}
