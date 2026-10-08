var e=`// 标签内容 | labelContent 决定标签写什么：取 name-value 等内建写法，或给函数自己拼；返回空串的扇区不写标签
import type { PieLabelDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhPieChartRoot } from "@xihan-ui/react";

const rows = [
  { category: "服饰", revenue: 386 },
  { category: "数码", revenue: 274 },
  { category: "家居", revenue: 158 },
  { category: "美妆", revenue: 96 },
  { category: "图书", revenue: 42 },
];

// 写金额与占比两样；不到 5% 的扇区交给图例与提示框
function labelOf(slice: PieLabelDetails): string {
  return slice.share < 0.05 ? "" : \`\${slice.name} \${slice.formatted.value} 万（\${slice.formatted.share}）\`;
}

export default function Demo(): ReactNode {
  return (
    <XhPieChartRoot
      data={rows}
      nameField="category"
      valueField="revenue"
      labelContent={labelOf}
      caption="各品类营收"
    />
  );
}
`;export{e as default};