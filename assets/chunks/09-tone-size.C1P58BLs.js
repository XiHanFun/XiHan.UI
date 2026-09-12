const e=`// 语气与尺寸 | tone 换勾选方框的色族，size 换方框边长与文字档；两轴打在组容器上，条目自己不写
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "warning", size: "md", label: "warning" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
      {rows.map(row => (
        <XhCheckboxGroupRoot
          key={row.label}
          collection={items}
          defaultValue={["cheese"]}
          tone={row.tone}
          size={row.size}
          label={row.label}
        />
      ))}
    </div>
  );
}
`;export{e as default};
