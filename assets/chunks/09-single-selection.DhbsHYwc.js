const e=`// 单选 | selectionMode 给 single：选中集合最多一个元素，点已选中的那行再点一次就清空，焦点行按空格同理
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

// 单选下全选把手不生效，表头那一格空着即可
const columns = [
  { id: "select", width: "3rem" },
  { id: "plan", label: "套餐", width: "8rem" },
  { id: "price", label: "价格" },
];

const plans = [
  { id: "p1", plan: "入门版", price: "¥ 0 / 月" },
  { id: "p2", plan: "团队版", price: "¥ 99 / 月" },
  { id: "p3", plan: "企业版", price: "¥ 399 / 月" },
];

const rows = plans.map(p => ({ id: p.id }));

export default function Demo(): ReactNode {
  const [selection, setSelection] = useState<string[]>(["p2"]);

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        selection={selection}
        columns={columns}
        rows={rows}
        selectionMode="single"
        onSelectionChange={details => setSelection(Array.isArray(details.value) ? details.value : [])}
      >
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="select" />
            <XhTableColumnHeader value="plan">套餐</XhTableColumnHeader>
            <XhTableColumnHeader value="price">价格</XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {plans.map(p => (
            <XhTableRow key={p.id} value={p.id}>
              <XhTableCell value="select">
                <XhTableRowSelectTrigger>●</XhTableRowSelectTrigger>
              </XhTableCell>
              <XhTableCell value="plan">{p.plan}</XhTableCell>
              <XhTableCell value="price">{p.price}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span>{\`已选：\${selection.length ? selection.join("、") : "（无）"}\`}</span>
    </div>
  );
}
`;export{e as default};
