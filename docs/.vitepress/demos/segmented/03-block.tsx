// 撑满行宽 | block 让整组占满一行，各段等分剩余空间，长短不一的文字也排得齐
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";

const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "420px" }}>
      <XhSegmentedRoot
        collection={modes}
        block
        defaultValue="auto"
        aria-label="执行方式"
      />
    </div>
  );
}
