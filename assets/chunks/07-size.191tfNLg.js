const e=`// 尺寸 | size 换标签的高度、内边距与字号，不传 size 即默认档
import type { ReactNode } from "react";
import { XhTabsRoot } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", inlineSize: "100%" }}>
      {sizes.map(s => (
        <div key={s.label}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{s.label}</div>
          <XhTabsRoot
            size={s.size}
            collection={tabs}
            defaultValue="overview"
            style={{ inlineSize: "100%" }}
            renderPanel={node => \`\${node.label}面板\`}
          />
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
