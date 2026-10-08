var e=`// 点状形态 | 步数多或横向空间紧时，圆点收成不盛内容的小点，只标位置
import type { ReactNode } from "react";
import {
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/react";

const steps = ["提交申请", "资料初审", "现场核验", "复审公示", "发放证照"];

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot variant="dot" count={steps.length} defaultValue={2}>
      <XhStepsList>
        {steps.map((title, i) => (
          <XhStepsItem key={title} value={i}>
            <XhStepsTrigger>
              <XhStepsIndicator />
              <XhStepsTitle>{title}</XhStepsTitle>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        ))}
      </XhStepsList>
    </XhStepsRoot>
  );
}
`;export{e as default};