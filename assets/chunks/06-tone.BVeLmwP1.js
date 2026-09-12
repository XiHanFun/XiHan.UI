const n=`// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhComboboxRoot
          key={t}
          variant="subtle"
          tone={t}
          collection={fruits}
          clearable
          label={t}
          openOnClick
          placeholder="选择水果"
          style={{ width: "200px" }}
        />
      ))}
    </div>
  );
}
`;export{n as default};
