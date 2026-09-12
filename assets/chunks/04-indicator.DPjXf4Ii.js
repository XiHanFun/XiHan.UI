const n=`// 指示器与禁用 | indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const items = [
  {
    value: "ready",
    label: "已发布",
    content: "标题右侧那个箭头就是 indicator，展开时自动翻转。",
  },
  {
    value: "draft",
    label: "草稿（禁用）",
    content: "这一项展不开。",
    disabled: true,
  },
  {
    value: "archived",
    label: "已归档",
    content: "从第一项按方向键，会直接跳到这里。",
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot collection={items} defaultValue={["ready"]} />
    </div>
  );
}
`;export{n as default};
