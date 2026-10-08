var e=`// 撑满行宽 | segmented 形态加 block 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "420px" }}>
      <XhRadioGroupRoot
        variant="segmented"
        block
        collection={modes}
        defaultValue="auto"
        label="执行方式"
      />
    </div>
  );
}
`;export{e as default};