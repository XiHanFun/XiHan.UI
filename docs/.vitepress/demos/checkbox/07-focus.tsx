// 命令式聚焦 | 节点由作者自己写，DOM 引用因此拿得到：聚焦、失焦与翻转都走命令式
import type { ReactNode } from "react";
import { useCheckbox } from "@xihan-ui/react";
import { useRef } from "react";

export default function Demo(): ReactNode {
  const { api } = useCheckbox({});
  const box = useRef<HTMLButtonElement | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* 两个节点与组件外壳渲染的是同一套：属性来自 getRootProps 与 getIndicatorProps */}
      <button ref={box} {...api.getRootProps()}>
        <span {...api.getIndicatorProps()} />
      </button>
      <button type="button" onClick={() => box.current?.focus()}>聚焦</button>
      <button type="button" onClick={() => box.current?.blur()}>失焦</button>
      <button type="button" onClick={() => api.setChecked(!api.checked)}>翻转</button>
      <span>
        当前：
        {api.checked ? "已勾选" : "未勾选"}
      </span>
    </div>
  );
}
