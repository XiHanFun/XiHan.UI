// 聚焦与选区 | input 部件就是一个原生 input，拿到它的节点就能聚焦、全选、把光标挪到末尾
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useRef } from "react";

export default function Demo(): ReactNode {
  // 组件只渲染一个 input，ref 直接落在它身上
  const input = useRef<HTMLInputElement | null>(null);

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
    <XhTextFieldRoot defaultValue="曦寒组件库">
      <XhTextFieldLabel>标题</XhTextFieldLabel>
      <XhTextFieldControl style={{ inlineSize: "220px" }}>
        <XhTextFieldInput ref={input} />
      </XhTextFieldControl>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={() => input.current?.focus()}>聚焦</button>
        <button type="button" onClick={selectAll}>全选</button>
        <button type="button" onClick={caretToEnd}>光标移到末尾</button>
        <button type="button" onClick={() => input.current?.blur()}>失焦</button>
      </div>
    </XhTextFieldRoot>
  );
}
