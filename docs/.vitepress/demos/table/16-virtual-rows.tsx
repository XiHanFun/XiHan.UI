// 只渲窗口内的行 | 全量 rows 照常交给 root（那只是行序与行号的元信息，不产生 DOM），标记里只渲可见那一段，首尾用两块空白撑出真实滚动高度
import type { CSSProperties, ReactNode, UIEvent } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "no", label: "编号", width: "6rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const people = Array.from({ length: 2000 }, (_, i) => ({
  id: `u${i + 1}`,
  no: `#${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
}));

// 行号与总数按全量算，与渲染了哪几行无关
const rows = people.map(p => ({ id: p.id }));

// 行高写死才算得出窗口；上下各多渲几行做缓冲
const ROW_H = 36;
const WINDOW = 18;
const OVERSCAN = 4;

const rowStyle: CSSProperties = { blockSize: `${ROW_H}px` };

export default function Demo(): ReactNode {
  const [start, setStart] = useState(0);

  const end = Math.min(people.length, start + WINDOW);
  const visible = people.slice(start, end);

  const bodyStyle: CSSProperties = {
    paddingBlockStart: `${start * ROW_H}px`,
    paddingBlockEnd: `${(people.length - end) * ROW_H}px`,
  };

  function onScroll(event: UIEvent<HTMLElement>): void {
    const top = (event.target as HTMLElement).scrollTop;
    const first = Math.floor(top / ROW_H) - OVERSCAN;
    setStart(Math.min(Math.max(0, first), Math.max(0, people.length - WINDOW)));
  }

  return (
    <div style={{ width: "100%", maxWidth: "520px", display: "grid", gap: "12px" }}>
      {/* root 自己就是那个滚动容器，滚动量直接从它身上读 */}
      <XhTableRoot columns={columns} rows={rows} stickyHeader onScroll={onScroll}>
        <XhTableHeader>
          <XhTableRow style={rowStyle}>
            {columns.map(col => (
              <XhTableColumnHeader key={col.id} value={col.id}>
                {col.label}
              </XhTableColumnHeader>
            ))}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody style={bodyStyle}>
          {visible.map(p => (
            <XhTableRow key={p.id} value={p.id} style={rowStyle}>
              <XhTableCell value="no">{p.no}</XhTableCell>
              <XhTableCell value="name">{p.name}</XhTableCell>
              <XhTableCell value="dept">{p.dept}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span>
        {`共 ${people.length} 行，此刻在 DOM 里的是第 ${start + 1} – ${end} 行`}
      </span>
    </div>
  );
}
