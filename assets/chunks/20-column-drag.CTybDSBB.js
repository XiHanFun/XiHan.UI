const e=`// 拖拽换列位 | 列上标了 reorderable 才认拖拽把手；也可以 Tab 到它用方向键挪，Home / End 到两头
import type { TableColumnPreference } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnDragTrigger,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";
import { useState } from "react";

// 标了 reorderable 的列才产出把手。没标的列是屏障：拖不过去，也落不到它身上
const columns = [
  { id: "name", label: "姓名", width: 120, reorderable: true },
  { id: "dept", label: "部门", width: 150, reorderable: true },
  { id: "city", label: "城市", width: 120, reorderable: true },
  { id: "ops", label: "操作", width: 100 },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
];

const rows = members.map(m => ({ id: m.id }));

// 列序由偏好决定，渲染顺序读 api.columns；这里照它取每行的格子
function cell(m: (typeof members)[number], id: string): string {
  return ({ name: m.name, dept: m.dept, city: m.city, ops: "编辑" } as Record<string, string>)[id] ?? "";
}

export default function Demo(): ReactNode {
  // 换位落在列偏好的 order 里，可以直接存起来下次还原
  const [preference, setPreference] = useState<TableColumnPreference>({});

  return (
    <div style={{ width: "100%", maxWidth: "560px", display: "grid", gap: "12px" }}>
      <XhTableRoot
        columnPreference={preference}
        columns={columns}
        rows={rows}
        onColumnPreferenceChange={details => setPreference(details.value)}
      >
        {({ columns: effective }) => (
          <>
            <XhTableCaption>拖列标题左侧的抓手换位；「操作」列没标 reorderable，拖不动也拖不过去</XhTableCaption>
            <XhTableHeader>
              <XhTableRow>
                {effective.map(col => (
                  <XhTableColumnHeader key={col.id} value={col.id}>
                    {/* 把手在标题之前；不可拖的列它自己报不可用 */}
                    <XhTableColumnDragTrigger />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {col.label}
                    </span>
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              {members.map(m => (
                <XhTableRow key={m.id} value={m.id}>
                  {effective.map(col => (
                    <XhTableCell key={col.id} value={col.id}>
                      {cell(m, col.id)}
                    </XhTableCell>
                  ))}
                </XhTableRow>
              ))}
            </XhTableBody>
          </>
        )}
      </XhTableRoot>
      <span>{\`列序：\${preference.order?.join(" → ") ?? "（还没改过）"}\`}</span>
    </div>
  );
}
`;export{e as default};
