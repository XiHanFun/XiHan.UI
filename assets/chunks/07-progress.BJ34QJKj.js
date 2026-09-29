const t=`// 当前步进度 | 用 percent 在当前步的圆点外画一圈进度环，报出这一步自己完成了多少
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
  { title: "选择文件", description: "共 12 个" },
  { title: "上传", description: "已传 7 个" },
  { title: "校验", description: "等待中" },
];

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot count={steps.length} defaultValue={1} percent={60}>
      {({ value }) => (
        <XhStepsList>
          {steps.map((s, i) => (
            <XhStepsItem key={s.title} value={i}>
              <XhStepsTrigger>
                <XhStepsIndicator>{value > i ? "" : i + 1}</XhStepsIndicator>
                <XhStepsTitle>{s.title}</XhStepsTitle>
                <XhStepsDescription>{s.description}</XhStepsDescription>
              </XhStepsTrigger>
              <XhStepsSeparator />
            </XhStepsItem>
          ))}
        </XhStepsList>
      )}
    </XhStepsRoot>
  );
}
`;export{t as default};
