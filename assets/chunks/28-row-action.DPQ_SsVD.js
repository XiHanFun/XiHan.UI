var e=`// 行主操作 | 点一行报告行与点中的那一列，焦点停在行上按 Enter 报告行：据此下钻或联动
import type { TableActionDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "region", label: "大区", width: "8rem" },
  { id: "orders", label: "订单", align: "end" as const },
  { id: "amount", label: "金额", align: "end" as const },
];

const sales = [
  { id: "north", region: "华北", orders: "1,204", amount: "¥ 386,200" },
  { id: "east", region: "华东", orders: "2,318", amount: "¥ 742,900" },
  { id: "south", region: "华南", orders: "1,876", amount: "¥ 590,400" },
];

const rows = sales.map(s => ({ id: s.id }));

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<TableActionDetails | null>(null);

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "8px" }}>
      <XhTableRoot columns={columns} rows={rows} onAction={setPicked}>
        <XhTableHeader>
          <XhTableRow>
            {columns.map(col => (
              <XhTableColumnHeader key={col.id} value={col.id}>
                <XhTableColumnLabel>{col.label}</XhTableColumnLabel>
              </XhTableColumnHeader>
            ))}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {sales.map(s => (
            <XhTableRow key={s.id} value={s.id}>
              <XhTableCell value="region">{s.region}</XhTableCell>
              <XhTableCell value="orders">{s.orders}</XhTableCell>
              <XhTableCell value="amount">{s.amount}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
      </XhTableRoot>
      <span data-demo-output>
        {picked ? \`行 \${picked.value}，列 \${picked.column ?? "（键盘）"}\` : "点一行，或焦点停在行上按 Enter"}
      </span>
    </div>
  );
}
`;export{e as default};