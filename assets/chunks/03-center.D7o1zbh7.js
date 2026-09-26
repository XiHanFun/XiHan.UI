const n=`// 自定义中心 | center 插槽替换环形中心的缺省合计：这里写出结论，而不是再放一个数字
import type { ReactNode } from "react";
import { XhPieChartRoot } from "@xihan-ui/react";

const tasks = [
  { status: "已完成", count: 72 },
  { status: "进行中", count: 18 },
  { status: "未开始", count: 10 },
];

// 中心写的是「完成了多少」，读者不用自己去加
const done = Math.round((tasks[0]!.count / tasks.reduce((sum, t) => sum + t.count, 0)) * 100);

export default function Demo(): ReactNode {
  return (
    <XhPieChartRoot
      data={tasks}
      nameField="status"
      valueField="count"
      sort="none"
      caption="本迭代任务"
      renderCenter={() => (
        <>
          <span style={{ fontSize: "var(--xh-text-heading-3-size)", fontWeight: "var(--xh-font-weight-semibold)" }}>
            {\`\${done}%\`}
          </span>
          <span style={{ color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-secondary-size)" }}>已完成</span>
        </>
      )}
    />
  );
}
`;export{n as default};
