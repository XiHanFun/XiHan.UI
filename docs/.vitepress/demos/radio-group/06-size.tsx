// 尺寸 | size 改条目间距与字号，不写即缺省中档
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
      <XhRadioGroupRoot
        collection={plans}
        defaultValue="standard"
        label="sm"
        size="sm"
      />

      <XhRadioGroupRoot collection={plans} defaultValue="standard" label="缺省" />

      <XhRadioGroupRoot
        collection={plans}
        defaultValue="standard"
        label="lg"
        size="lg"
      />
    </div>
  );
}
