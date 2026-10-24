// 数据驱动的虚拟滚动 | 一万行只加一个 virtual：表体只铺滚到的那一屏，滚的是表格根节点，吸顶表头、排序与方向键仍按完整的一万行算；Virtualizer 那一块开了才加载
import type { TableColumnDef } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhTableRoot } from "@xihan-ui/react";

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const columns: TableColumnDef[] = [
  { id: "no", label: "编号", width: "6rem", sortable: true },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门", filterOptions: depts.map(value => ({ value })) },
];

const people = Array.from({ length: 10000 }, (_, i) => ({
  id: `u${i + 1}`,
  no: i + 1,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
}));

export default function Demo(): ReactNode {
  return (
    <XhTableRoot
      columns={columns}
      data={people}
      virtual
      stickyHeader
      aria-label="员工"
      style={{ inlineSize: "100%", maxInlineSize: "520px" }}
    />
  );
}
