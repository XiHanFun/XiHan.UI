const n=`// 单元格就地编辑 | 表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上掐断冒泡这些键就回归输入框自己
import type { KeyboardEvent, ReactNode } from "react";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "item", label: "条目", width: "9rem" },
  { id: "count", label: "数量", width: "6rem" },
  { id: "note", label: "备注" },
];

const initial = [
  { id: "l1", item: "键盘", count: 2, note: "机械轴" },
  { id: "l2", item: "鼠标", count: 3, note: "无线" },
  { id: "l3", item: "显示器支架", count: 1, note: "" },
];

// 行序不随编辑变化，rows 取一次即可
const rows = initial.map(line => ({ id: line.id }));

// keydown 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行。
// Escape 把焦点交还所在行，表体的方向键随即恢复
function onEditKeydown(event: KeyboardEvent<HTMLInputElement>): void {
  event.stopPropagation();
  if (event.key !== "Escape")
    return;
  event.currentTarget.closest<HTMLElement>("[data-part='row']")?.focus();
}

export default function Demo(): ReactNode {
  const [lines, setLines] = useState(initial);

  function patch(id: string, next: Partial<(typeof initial)[number]>): void {
    setLines(prev => prev.map(line => (line.id === id ? { ...line, ...next } : line)));
  }

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot columns={columns} rows={rows}>
        <XhTableCaption>采购清单</XhTableCaption>
        <XhTableHeader>
          <XhTableRow>
            {columns.map(col => (
              <XhTableColumnHeader key={col.id} value={col.id}>
                {col.label}
              </XhTableColumnHeader>
            ))}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {lines.map(line => (
            <XhTableRow key={line.id} value={line.id}>
              <XhTableCell value="item">{line.item}</XhTableCell>
              <XhTableCell value="count">
                <input
                  value={line.count}
                  type="number"
                  min="0"
                  aria-label={\`\${line.item} 数量\`}
                  style={{ inlineSize: "100%", minInlineSize: 0 }}
                  onKeyDown={onEditKeydown}
                  onChange={event => patch(line.id, { count: Number(event.target.value) })}
                />
              </XhTableCell>
              <XhTableCell value="note">
                <input
                  value={line.note}
                  type="text"
                  placeholder="可以打空格"
                  aria-label={\`\${line.item} 备注\`}
                  style={{ inlineSize: "100%", minInlineSize: 0 }}
                  onKeyDown={onEditKeydown}
                  onChange={event => patch(line.id, { note: event.target.value })}
                />
              </XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span>
        {\`合计 \${lines.reduce((sum, line) => sum + (line.count || 0), 0)} 件\`}
      </span>
    </div>
  );
}
`;export{n as default};
