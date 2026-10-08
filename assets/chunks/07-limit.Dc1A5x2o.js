var e=`// 限定选择数 | min / max 约束选中数：选满时没选的项置灰，降到下限时已选的项摘不掉
import type { ReactNode } from "react";
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/react";

const items = [
  { value: "design", label: "设计" },
  { value: "frontend", label: "前端" },
  { value: "backend", label: "后端" },
  { value: "data", label: "数据" },
];

export default function Demo(): ReactNode {
  return (
    <XhCheckboxGroupRoot defaultValue={["design"]} min={1} max={2}>
      {({ value, atMax }) => (
        <>
          <XhCheckboxGroupLabel>擅长方向（选 1 到 2 项）</XhCheckboxGroupLabel>
          {items.map(item => (
            <XhCheckboxGroupItem key={item.value} value={item.value}>
              <XhCheckboxGroupIndicator />
              <XhCheckboxGroupItemText>{item.label}</XhCheckboxGroupItemText>
            </XhCheckboxGroupItem>
          ))}
          <span>{\`已选 \${value.length} 项\${atMax ? "，已达上限" : ""}\`}</span>
        </>
      )}
    </XhCheckboxGroupRoot>
  );
}
`;export{e as default};