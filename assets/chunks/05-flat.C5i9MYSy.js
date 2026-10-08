var e=`// 扁平的行 | 数据是一张表时写 idField 与 parentField，按父节点的身份组树
import type { ReactNode } from "react";
import { XhHierarchyChartRoot } from "@xihan-ui/react";

// 每行一个节点，parent 指向上一层的 id；只有最底层写人数
const rows = [
  { id: "company", parent: null, name: "公司" },
  { id: "rd", parent: "company", name: "研发中心" },
  { id: "fe", parent: "rd", name: "前端", value: 28 },
  { id: "be", parent: "rd", name: "后端", value: 42 },
  { id: "qa", parent: "rd", name: "测试", value: 15 },
  { id: "biz", parent: "company", name: "业务中心" },
  { id: "sales", parent: "biz", name: "销售", value: 36 },
  { id: "ops", parent: "biz", name: "运营", value: 22 },
  { id: "func", parent: "company", name: "职能" },
  { id: "hr", parent: "func", name: "人事", value: 9 },
  { id: "fin", parent: "func", name: "财务", value: 7 },
];

export default function Demo(): ReactNode {
  return (
    <XhHierarchyChartRoot
      data={rows}
      idField="id"
      parentField="parent"
      caption="各部门人数"
    />
  );
}
`;export{e as default};