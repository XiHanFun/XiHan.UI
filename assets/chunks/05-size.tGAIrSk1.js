const e=`// 密度 | size 只落成 root 的 data-size，换的是单元格纵向内边距与字号；三档并排，差别在行高上
import type { ReactNode } from "react";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";

const columns = [
  { id: "name", label: "姓名" },
  { id: "level", label: "职级" },
];

const members = [
  { id: "u1", name: "赵一", level: "P6" },
  { id: "u2", name: "钱二", level: "P7" },
  { id: "u3", name: "孙三", level: "P6" },
  { id: "u4", name: "李四", level: "P5" },
  { id: "u5", name: "周五", level: "P7" },
];

const rows = members.map(m => ({ id: m.id }));

// 中间档不传 size，缺省即中密度
const densities = [
  { key: "sm", size: "sm", label: "sm 紧凑" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 宽松" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {densities.map(d => (
        <div key={d.key} style={{ flex: "1 1 190px", minWidth: "190px" }}>
          <XhTableRoot columns={columns} rows={rows} size={d.size}>
            <XhTableCaption>{d.label}</XhTableCaption>
            <XhTableHeader>
              <XhTableRow>
                {columns.map(col => (
                  <XhTableColumnHeader key={col.id} value={col.id}>
                    {col.label}
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              {members.map(m => (
                <XhTableRow key={m.id} value={m.id}>
                  <XhTableCell value="name">{m.name}</XhTableCell>
                  <XhTableCell value="level">{m.level}</XhTableCell>
                </XhTableRow>
              ))}
            </XhTableBody>
          </XhTableRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
