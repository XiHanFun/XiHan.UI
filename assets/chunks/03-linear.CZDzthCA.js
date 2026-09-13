const t=`// 线性模式 | 只能返回已完成的步骤
import type { ReactNode } from "react";
import {
  XhStepsContent,
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
  { title: "实名认证", description: "身份信息已验证" },
  { title: "绑定银行卡", description: "填写本人银行卡" },
  { title: "签署协议", description: "完成后解锁" },
];

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot count={steps.length} defaultValue={1} linear>
      {({ value }) => (
        <>
          <XhStepsList>
            {steps.map((step, i) => (
              <XhStepsItem key={step.title} value={i}>
                <XhStepsTrigger>
                  <XhStepsIndicator>{value > i ? "" : i + 1}</XhStepsIndicator>
                  <XhStepsTitle>{step.title}</XhStepsTitle>
                  <XhStepsDescription>{step.description}</XhStepsDescription>
                </XhStepsTrigger>
                <XhStepsSeparator />
              </XhStepsItem>
            ))}
          </XhStepsList>

          <XhStepsContent value={0}>核对身份信息。</XhStepsContent>
          <XhStepsContent value={1}>填写本人银行卡。</XhStepsContent>
          <XhStepsContent value={2}>阅读并签署服务协议。</XhStepsContent>
          <XhStepsContent value={steps.length}>认证已完成。</XhStepsContent>
        </>
      )}
    </XhStepsRoot>
  );
}
`;export{t as default};
