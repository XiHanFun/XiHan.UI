const n=`// 尺寸 | size 换的是标题栏的高度、内边距与字号，三档并排对照
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const another = {
  value: "b",
  label: "另一项",
  content: "同一档内所有标题一致。",
};

// 中间一档不写 size，用 undefined 表达
const groups = [
  {
    size: "sm" as const,
    key: "sm",
    panels: [
      { value: "a", label: "小号 sm", content: "标题栏最矮，字号也最小。" },
      another,
    ],
  },
  {
    size: undefined,
    key: "md",
    panels: [
      { value: "a", label: "缺省档", content: "不写 size 就是这一档。" },
      another,
    ],
  },
  {
    size: "lg" as const,
    key: "lg",
    panels: [
      { value: "a", label: "大号 lg", content: "标题栏最高，字号也最大。" },
      another,
    ],
  },
];

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        alignItems: "start",
      }}
    >
      {groups.map(group => (
        <XhAccordionRoot
          key={group.key}
          size={group.size}
          collection={group.panels}
          defaultValue={["a"]}
        />
      ))}
    </div>
  );
}
`;export{n as default};
