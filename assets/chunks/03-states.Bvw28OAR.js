const e=`// 状态 | 禁用整组置灰、只读只挡落值不挡焦点、无效把描边转成警示色
import type { ReactNode } from "react";
import { XhColorSwatchPickerRoot } from "@xihan-ui/react";

const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      <XhColorSwatchPickerRoot swatches={swatches} defaultValue="#10b981" label="禁用" disabled />
      <XhColorSwatchPickerRoot swatches={swatches} defaultValue="#10b981" label="只读" readOnly />
      <XhColorSwatchPickerRoot swatches={swatches} label="必填未选" invalid required />
    </div>
  );
}
`;export{e as default};
