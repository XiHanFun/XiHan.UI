// 受控 | 传了 value 就由宿主说了算，组件自己不再改步序；切步意图从 value-change 出来，写回才真的切
import type { ReactNode } from "react";
import {
  XhButton,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const steps = ["提交申请", "主管审批", "财务复核", "归档"];

export default function Demo(): ReactNode {
  const [current, setCurrent] = useState(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhStepsRoot
        value={current}
        count={steps.length}
        onValueChange={details => setCurrent(details.value)}
      >
        <XhStepsList>
          {steps.map((s, i) => (
            <XhStepsItem key={s} value={i}>
              <XhStepsTrigger>
                <XhStepsIndicator>{current > i ? "" : i + 1}</XhStepsIndicator>
                <XhStepsTitle>{s}</XhStepsTitle>
              </XhStepsTrigger>
              <XhStepsSeparator />
            </XhStepsItem>
          ))}
        </XhStepsList>
      </XhStepsRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton variant="outline" onClick={() => setCurrent(0)}>回到第一步</XhButton>
        <XhButton variant="outline" onClick={() => setCurrent(steps.length)}>直接完成</XhButton>
        <span>
          当前 value：
          {current}
        </span>
      </div>
    </div>
  );
}
