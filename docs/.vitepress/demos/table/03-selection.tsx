// 多选 | selectionMode 默认 none，声明 multiple 才有选择机制；选择列也要在 columns 里占一条，否则右侧列号串位
import type { TableSelection } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "select", width: "3rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发" },
  { id: "u2", name: "钱二", dept: "前端体验" },
  { id: "u3", name: "孙三", dept: "基础架构" },
  { id: "u4", name: "李四（禁用）", dept: "质量保障" },
];

// 禁用行选不动，也不算进全选的基数
const rows = [
  { id: "u1" },
  { id: "u2" },
  { id: "u3" },
  { id: "u4", disabled: true },
];

export default function Demo(): ReactNode {
  const [selection, setSelection] = useState<TableSelection>(["u2"]);

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        selection={selection}
        columns={columns}
        rows={rows}
        selectionMode="multiple"
        onSelectionChange={details => setSelection(details.value)}
      >
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="select">
              {/* 全选把手是三态的唯一载体，自己占一个 Tab 位 */}
              <XhTableSelectAllTrigger />
            </XhTableColumnHeader>
            <XhTableColumnHeader value="name">姓名</XhTableColumnHeader>
            <XhTableColumnHeader value="dept">部门</XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {members.map(m => (
            <XhTableRow key={m.id} value={m.id}>
              <XhTableCell value="select">
                <XhTableRowSelectTrigger />
              </XhTableCell>
              <XhTableCell value="name">{m.name}</XhTableCell>
              <XhTableCell value="dept">{m.dept}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span>
        {`选中：${selection === "all" ? "全部" : selection.length ? selection.join("、") : "（无）"}`}
      </span>
    </div>
  );
}
