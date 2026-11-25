// 分段形态 | variant="segmented" 把一排短选项画成一条轨道，选中段由滑块标出，换段时滑块滑过去；缺省横排；加 fullWidth 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const ranges = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--xh-space-6)" }}>
      {/* 轨道里不排可见标题：label 在这一形态下只作可及名 */}
      <XhRadioGroupRoot
        variant="segmented"
        collection={ranges}
        defaultValue="week"
        label="时间粒度"
      />

      <div style={{ inlineSize: "420px" }}>
        <XhRadioGroupRoot
          variant="segmented"
          fullWidth
          collection={modes}
          defaultValue="auto"
          label="执行方式"
        />
      </div>
    </div>
  );
}
