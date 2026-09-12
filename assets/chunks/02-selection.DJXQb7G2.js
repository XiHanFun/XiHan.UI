const e=`// 可选中 | selectionMode 决定点一枚是替换还是加选；Ctrl/Cmd + A 全选
import type { ReactNode } from "react";
import { XhTagGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const topics = [
  { value: "design", label: "设计" },
  { value: "a11y", label: "无障碍" },
  { value: "motion", label: "动效" },
  { value: "legacy", label: "已归档", disabled: true },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["design"]);

  return (
    <>
      <XhTagGroupRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={topics}
        label="话题"
        selectionMode="multiple"
        variant="outline"
        tone="brand"
      />
      <p>{\`已选：\${picked.length ? picked.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
