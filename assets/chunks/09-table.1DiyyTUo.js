var e=`// 可见的数据表 | 根的作用域交出 table：交给表格组件就是一张看得见的数据表，列名、数值格式与占比口径都与图同一份，不必在图下另写一遍数据
import type { ReactNode } from "react";
import {
  XhPieChartCaption,
  XhPieChartCenter,
  XhPieChartEmpty,
  XhPieChartLegend,
  XhPieChartPlot,
  XhPieChartRoot,
  XhPieChartTooltip,
  XhPieChartViewport,
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/react";

const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];

export default function Demo(): ReactNode {
  return (
    // 写了函数式 children 就不再铺缺省结构：图的各部件照常摆出来，表格接在后面
    <XhPieChartRoot data={rows} nameField="channel" valueField="visits">
      {({ table }) => (
        <>
          <XhPieChartCaption>访问来源</XhPieChartCaption>
          <XhPieChartLegend />
          <XhPieChartViewport>
            <XhPieChartPlot />
            <XhPieChartCenter />
            <XhPieChartEmpty />
          </XhPieChartViewport>
          <XhPieChartTooltip />
          <XhTableRoot columns={[...table.columns]} rows={table.rows.map(row => ({ id: String(row.key) }))}>
            <XhTableCaption>各来源的访问量</XhTableCaption>
            <XhTableHeader>
              <XhTableRow>
                {table.columns.map(column => (
                  <XhTableColumnHeader key={column.id} value={column.id}>
                    <XhTableColumnLabel>{column.label}</XhTableColumnLabel>
                  </XhTableColumnHeader>
                ))}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              {table.rows.map(row => (
                <XhTableRow key={String(row.key)} value={String(row.key)}>
                  {row.cells.map((cell, i) => (
                    <XhTableCell key={table.columns[i]!.id} value={table.columns[i]!.id}>{cell.text}</XhTableCell>
                  ))}
                </XhTableRow>
              ))}
            </XhTableBody>
          </XhTableRoot>
        </>
      )}
    </XhPieChartRoot>
  );
}
`;export{e as default};