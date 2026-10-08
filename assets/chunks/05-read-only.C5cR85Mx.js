var e=`// 只读展示 | 只呈现进度：步骤不可点、不可聚焦，也不置灰
import type { ReactNode } from "react";
import {
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/react";

const steps = [
  { title: "已下单", description: "09-26 10:12" },
  { title: "已发货", description: "09-26 16:40" },
  { title: "运输中", description: "预计明日送达" },
  { title: "已签收", description: "" },
];

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot count={steps.length} value={2} readOnly translations={{ list: "物流进度" }}>
      <XhStepsList>
        {steps.map((s, i) => (
          <XhStepsItem key={s.title} value={i}>
            <XhStepsTrigger>
              <XhStepsIndicator>{i < 2 ? "" : i + 1}</XhStepsIndicator>
              <XhStepsTitle>{s.title}</XhStepsTitle>
              {s.description ? <XhStepsDescription>{s.description}</XhStepsDescription> : null}
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        ))}
      </XhStepsList>
    </XhStepsRoot>
  );
}
`;export{e as default};