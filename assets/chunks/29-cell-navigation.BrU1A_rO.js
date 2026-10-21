var e=`// 单元格导航 | navigation="cell" 照 treegrid 在格子之间走：Tab 进表体落在行上，右键进到格子，方向键在格子之间走、上下键走同一列；Enter 或 F2 进格内的输入框编辑，编辑时方向键归输入框，Esc 退回格子
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
  XhTextFieldRoot,
} from "@xihan-ui/react";

const columns = [
  { id: "label", label: "显示名", width: "16rem" },
  { id: "value", label: "取值" },
];

// 选项树：父子由 parentId 定
const options = [
  { id: "east", label: "华东", value: "east" },
  { id: "sh", label: "上海", value: "shanghai", parentId: "east" },
  { id: "hz", label: "杭州", value: "hangzhou", parentId: "east" },
  { id: "south", label: "华南", value: "south" },
  { id: "gz", label: "广州", value: "guangzhou", parentId: "south" },
];

const byId = new Map(options.map(option => [option.id, option]));
const rows = options.map(option => ({ id: option.id, parentId: option.parentId }));

export default function Demo(): ReactNode {
  return (
    <XhTableRoot
      columns={columns}
      rows={rows}
      defaultExpandedValue={["east", "south"]}
      navigation="cell"
      aria-label="地区选项"
      style={{ width: "100%", maxWidth: 560 }}
    >
      {({ visibleRows }) => (
        <>
          <XhTableHeader>
            <XhTableRow>
              <XhTableColumnHeader value="label"><XhTableColumnLabel>显示名</XhTableColumnLabel></XhTableColumnHeader>
              <XhTableColumnHeader value="value"><XhTableColumnLabel>取值</XhTableColumnLabel></XhTableColumnHeader>
            </XhTableRow>
          </XhTableHeader>
          <XhTableBody>
            {visibleRows.filter(item => item.kind === "data").map(row => (
              <XhTableRow key={row.id} value={row.id}>
                <XhTableCell value="label" style={{ paddingInlineStart: \`\${row.level * 16}px\` }}>
                  {row.level === 1 ? <XhTableExpandTrigger /> : null}
                  <XhTextFieldRoot size="sm" defaultValue={byId.get(row.id)?.label} ariaLabel={\`\${byId.get(row.id)?.label}的显示名\`} />
                </XhTableCell>
                <XhTableCell value="value">
                  <XhTextFieldRoot size="sm" defaultValue={byId.get(row.id)?.value} ariaLabel={\`\${byId.get(row.id)?.label}的取值\`} />
                </XhTableCell>
              </XhTableRow>
            ))}
          </XhTableBody>
        </>
      )}
    </XhTableRoot>
  );
}
`;export{e as default};