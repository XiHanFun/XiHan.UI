// 玫瑰图 | rose 让角度均分、半径按数值：面积与数值成正比，适合各项差距悬殊时拉开层次
import type { ReactNode } from "react";
import { XhPieChartRoot } from "@xihan-ui/react";

// 季度有自然次序，sort="none" 按数据次序排，不按大小
const rows = [
  { quarter: "一季度", users: 120 },
  { quarter: "二季度", users: 210 },
  { quarter: "三季度", users: 340 },
  { quarter: "四季度", users: 460 },
];

export default function Demo(): ReactNode {
  return (
    <XhPieChartRoot
      data={rows}
      nameField="quarter"
      valueField="users"
      rose
      sort="none"
      caption="各季度新增用户（千人）"
    />
  );
}
