const e=`// 树形表级联勾选 | cascade 与树的级联同一套算法：勾父行整枝带上，子行勾满父行跟着勾中、勾了一部分显示半选，禁用行的子树不动；对外值缺省只收叶行
import type { TableSelection } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "select", width: "3rem" },
  { id: "name", label: "组织", width: "13rem" },
  { id: "owner", label: "负责人" },
];

const units = [
  { id: "rd", label: "研发中心", owner: "赵一", parentId: undefined },
  { id: "rd-web", label: "前端组", owner: "钱二", parentId: "rd" },
  { id: "rd-api", label: "服务端组", owner: "孙三", parentId: "rd" },
  { id: "rd-lab", label: "实验室（冻结）", owner: "李四", parentId: "rd", disabled: true },
  { id: "ops", label: "运维中心", owner: "周五", parentId: undefined },
  { id: "ops-sre", label: "稳定性组", owner: "吴六", parentId: "ops" },
];

const byId = new Map(units.map(unit => [unit.id, unit]));
const rows = units.map(unit => ({ id: unit.id, parentId: unit.parentId, disabled: unit.disabled }));

export default function Demo(): ReactNode {
  const [selection, setSelection] = useState<TableSelection>([]);
  return (
    <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: 12 }}>
      <XhTableRoot
        columns={columns}
        rows={rows}
        defaultExpandedValue={["rd", "ops"]}
        selectionMode="multiple"
        cascade
        selection={selection}
        onSelectionChange={details => setSelection(details.value)}
      >
        {({ visibleRows }) => (
          <>
            <XhTableHeader>
              <XhTableRow>
                <XhTableColumnHeader value="select"><XhTableSelectAllTrigger /></XhTableColumnHeader>
                <XhTableColumnHeader value="name"><XhTableColumnLabel>组织</XhTableColumnLabel></XhTableColumnHeader>
                <XhTableColumnHeader value="owner"><XhTableColumnLabel>负责人</XhTableColumnLabel></XhTableColumnHeader>
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              {visibleRows.filter(item => item.kind === "data").map(row => (
                <XhTableRow key={row.id} value={row.id}>
                  <XhTableCell value="select"><XhTableRowSelectTrigger /></XhTableCell>
                  <XhTableCell value="name" style={{ paddingInlineStart: \`\${row.level * 16}px\` }}>
                    {row.level === 1 ? <XhTableExpandTrigger /> : null}
                    {byId.get(row.id)?.label}
                  </XhTableCell>
                  <XhTableCell value="owner">{byId.get(row.id)?.owner}</XhTableCell>
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>
      <span>{\`选中：\${selection === "all" ? "全部" : selection.length ? selection.join("、") : "（无）"}\`}</span>
    </div>
  );
}
`;export{e as default};
