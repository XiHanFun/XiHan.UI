// 数据驱动 | 给 data 与 columns 就是一张会排序、会筛选、会分页的表：列 id 即字段名，排序、筛选与切页都由表格自己算，表后自动铺一组分页
import type { TableColumnDef } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhTableRoot } from "@xihan-ui/react";
import { useState } from "react";

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
const levels = ["P5", "P6", "P7", "P8"];

// 列 id 即字段名：排序按字段值比，给了 filterOptions 的列在列头铺一颗筛选钮
const columns: TableColumnDef[] = [
  { id: "name", label: "姓名", width: "8rem", sortable: true },
  { id: "dept", label: "部门", sortable: true, filterOptions: depts.map(value => ({ value })) },
  { id: "level", label: "职级", width: "6rem", sortable: true, filterOptions: levels.map(value => ({ value })) },
  { id: "joined", label: "入职", width: "6rem", sortable: true, format: value => `${String(value)} 年` },
];

const members = Array.from({ length: 36 }, (_, i) => ({
  id: `u${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
  level: levels[(i * 7) % levels.length],
  joined: 2016 + ((i * 5) % 9),
}));

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);
  return (
    <div style={{ width: "100%", maxWidth: "640px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        columns={columns}
        data={members}
        pageSize={8}
        pagination
        page={page}
        onPageChange={({ value }) => setPage(value)}
        aria-label="成员"
      />
      <span data-demo-output>{`第 ${page} 页`}</span>
    </div>
  );
}
