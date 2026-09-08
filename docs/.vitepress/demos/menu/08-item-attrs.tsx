// 条目自带的属性与事件 | 条目上的原生属性照常生效，自己挂的 click 与内部的选中处理并存
import type { ReactNode } from "react";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [trace, setTrace] = useState<string[]>([]);

  function push(text: string): void {
    setTrace(prev => [text, ...prev].slice(0, 4));
  }

  function onSelect(details: { value: string }): void {
    push(`菜单的 select：${details.value}`);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhMenuRoot onSelect={onSelect}>
        <XhMenuTrigger>导出</XhMenuTrigger>
        <XhMenuPositioner>
          <XhMenuContent>
            {/* title 是原生属性，悬停就出提示；onClick 与内部的选中处理两边都会跑 */}
            <XhMenuItem
              value="csv"
              title="逗号分隔，表格软件直接打得开"
              onClick={() => push("条目自己的 click：csv")}
            >
              导出 CSV
            </XhMenuItem>
            <XhMenuItem value="json" title="结构化数据，留给程序读">
              导出 JSON
            </XhMenuItem>
            <XhMenuItem value="pdf" disabled title="当前视图不支持">
              导出 PDF
            </XhMenuItem>
          </XhMenuContent>
        </XhMenuPositioner>
      </XhMenuRoot>

      <ol style={{ display: "grid", gap: "4px", margin: 0, paddingInlineStart: "20px" }}>
        {trace.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
        {trace.length === 0 ? <li>（还没动过）</li> : null}
      </ol>
    </div>
  );
}
