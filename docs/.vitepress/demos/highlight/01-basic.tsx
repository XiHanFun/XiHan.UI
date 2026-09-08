// 基础用法 | 命中关键词的片段渲染成 `<mark>`，其余是纯文本；整段文本原样拼得回来
import type { ReactNode } from "react";
import { XhHighlight } from "@xihan-ui/react";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";

export default function Demo(): ReactNode {
  return (
    <XhHighlight text={text} keyword="组件" />
  );
}
