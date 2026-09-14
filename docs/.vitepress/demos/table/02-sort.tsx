// 排序 | 列上标了 sortable 才认排序把手；按住 Shift 点是追加到排序链，裸点是整条链换成这一列
import type { TableSortDescriptor } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

interface Member {
  id: string;
  name: string;
  dept: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "8rem", sortable: true },
  { id: "dept", label: "部门", sortable: true },
  { id: "level", label: "职级", width: "6rem" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", level: "P5" },
];

export default function Demo(): ReactNode {
  // 排序链是有序的：下标即优先级，第一个是主排序字段
  const [sort, setSort] = useState<TableSortDescriptor[]>([]);

  const sorted = useMemo(() => {
    if (!sort.length)
      return members;
    return [...members].sort((a, b) => {
      for (const s of sort) {
        const diff = String(a[s.id as keyof Member]).localeCompare(
          String(b[s.id as keyof Member]),
          "zh",
        );
        if (diff !== 0)
          return s.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }, [sort]);

  // 行序的事实源跟着排序结果走
  const rows = useMemo(() => sorted.map(m => ({ id: m.id })), [sorted]);

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        sort={sort}
        columns={columns}
        rows={rows}
        onSortChange={details => setSort(details.value)}
      >
        <XhTableHeader>
          <XhTableRow>
            {columns.map(col => (
              <XhTableColumnHeader key={col.id} value={col.id}>
                {col.sortable
                  ? <XhTableSortTrigger>{col.label}</XhTableSortTrigger>
                  : col.label}
              </XhTableColumnHeader>
            ))}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {sorted.map(m => (
            <XhTableRow key={m.id} value={m.id}>
              <XhTableCell value="name">{m.name}</XhTableCell>
              <XhTableCell value="dept">{m.dept}</XhTableCell>
              <XhTableCell value="level">{m.level}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span>
        {`排序链：${sort.length ? sort.map(s => `${s.id} ${s.direction}`).join(" → ") : "（无）"}`}
      </span>
    </div>
  );
}
