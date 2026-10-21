var e=`// 只渲染窗口内的行 | 一万行交给 Virtualizer：表格经 virtualizer 接上它的 collectionVirtualizer，行号与方向键仍按完整行序走，DOM 里只有窗口那十几行
import type { ReactNode } from "react";
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

export default function Demo(): ReactNode {
  return (
    // 表格根节点自己滚：虚拟滚动取最近的可滚动祖先（ancestor），吸顶表头、横向溢出与行在同一个滚动面里；视口不定高、不滚动，也不占 Tab 位
    // 行高不写死：estimateFromMeasured 按量到的行高估算还没渲染的行，换尺寸、密度或皮肤都跟得上
    <XhVirtualizerRoot
      count={people.length}
      estimateFromMeasured
      scrollContainer="ancestor"
      style={{ inlineSize: "100%", maxInlineSize: 520 }}
    >
      {({ virtualItems, collectionVirtualizer }) => (
        <XhTableRoot
          columns={columns}
          rows={rows}
          virtualizer={collectionVirtualizer}
          stickyHeader
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
            <XhVirtualizerViewport>
              <XhVirtualizerContent>
                {virtualItems.map((item) => {
                  const p = people[item.index]!;
                  return (
                    <XhVirtualizerItem key={item.key} value={item.index} measure>
                      <XhTableRow value={p.id}>
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