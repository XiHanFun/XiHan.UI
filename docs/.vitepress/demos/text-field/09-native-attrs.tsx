// 原生输入框 | input 部件就是一个原生 input：写在它上面的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定；聚焦失焦等原生事件也写在它上面，值的变化另经组件的 value-change；取得它的节点即可聚焦、全选、把光标移到末尾
import type { ReactNode } from "react";
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  // 组件只渲染一个 input，ref 直接落在它身上
  const input = useRef<HTMLInputElement | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // 新的排在最前，只留最近三条
  function push(text: string): void {
    setLog(prev => [text, ...prev].slice(0, 3));
  }

  function onValueChange(details: { value: string }): void {
    push(`value-change：${details.value || "（空）"}`);
  }

  function selectAll(): void {
    input.current?.focus();
    input.current?.select();
  }

  function caretToEnd(): void {
    const el = input.current;
    if (!el)
      return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }

  return (
    <>
      <XhTextFieldRoot
        defaultValue="hi@xihan.dev"
        placeholder="you@example.com"
        clearable
        onValueChange={onValueChange}
      >
        <XhTextFieldLabel>邮箱</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput
            ref={input}
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            onFocus={() => push("focus")}
            onBlur={() => push("blur")}
          />
        </XhTextFieldControl>
        <div style={{ display: "flex", gap: "var(--xh-space-2)" }}>
          <XhButton variant="outline" size="sm" onClick={() => input.current?.focus()}>聚焦</XhButton>
          <XhButton variant="outline" size="sm" onClick={selectAll}>全选</XhButton>
          <XhButton variant="outline" size="sm" onClick={caretToEnd}>光标移到末尾</XhButton>
        </div>
      </XhTextFieldRoot>

      <span data-demo-output>{log.join(" · ") || "还没有事件"}</span>
    </>
  );
}
