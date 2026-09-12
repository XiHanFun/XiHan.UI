const t=`// 尺寸 | size 换的是标签、数值与前后缀的字号，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "40px" }}>
      {sizes.map(s => (
        <XhStatisticRoot key={s.label} size={s.size}>
          <XhStatisticLabel>{s.label}</XhStatisticLabel>
          <XhStatisticValue>86.7</XhStatisticValue>
          <XhStatisticSuffix>%</XhStatisticSuffix>
        </XhStatisticRoot>
      ))}
    </div>
  );
}
`;export{t as default};
