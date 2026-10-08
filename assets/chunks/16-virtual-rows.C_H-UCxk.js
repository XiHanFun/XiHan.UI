var e=`// 只渲染窗口内的行 | 一万行交给 Virtualizer：表格经 virtualizer 接上它的 collectionVirtualizer，行号与方向键仍按完整行序走，DOM 里只有窗口那十几行
import type { CSSProperties, ReactNode } from "react";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";

const columns = [
  { id: "no", label: "编号", width: "6rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const people = Array.from({ length: 10000 }, (_, i) => ({
  id: \`u\${i + 1}\`,
  no: \`#\${i + 1}\`,
  name: \`员工 \${i + 1}\`,
  dept: depts[i % depts.length],
}));

// 行号与总数按全量算，与挂了哪几行无关
const rows = people.map(p => ({ id: p.id }));

// 行之间的分隔线：每行装在各自的虚拟条目里，彼此不是兄弟节点，分隔线写在行上
const rowStyle: CSSProperties = { blockSize: 36, borderBlockEnd: "1px solid var(--xh-border-subtle)" };

export default function Demo(): ReactNode {
  return (
    // 表体里的视口负责滚动：表格自己不再定高、不再滚；视口不占 Tab 位，键盘归表体
    <XhVirtualizerRoot
      count={people.length}
      estimateSize={36}
      viewportTabIndex={-1}
      style={{ inlineSize: "100%", maxInlineSize: 520 }}
    >
      {({ virtualItems, collectionVirtualizer }) => (
        <XhTableRoot
          columns={columns}
          rows={rows}
          virtualizer={collectionVirtualizer}
          style={{ maxBlockSize: "none", overflow: "visible" }}
        >
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
            <XhVirtualizerViewport style={{ blockSize: 320 }}>
              <XhVirtualizerContent>
                {virtualItems.map((item) => {
                  const p = people[item.index]!;
                  return (
                    <XhVirtualizerItem key={item.key} value={item.index}>
                      <XhTableRow value={p.id} style={rowStyle}>
                        <XhTableCell value="no">{p.no}</XhTableCell>
                        <XhTableCell value="name">{p.name}</XhTableCell>
                        <XhTableCell value="dept">{p.dept}</XhTableCell>
                      </XhTableRow>
                    </XhVirtualizerItem>
                  );
                })}
              </XhVirtualizerContent>
            </XhVirtualizerViewport>
          </XhTableBody>
        </XhTableRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{e as default};