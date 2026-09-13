/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 错误状态 | 标记需要用户处理的步骤
import type { ReactNode } from "react";
import { XIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
  { title: "提交材料", description: "已通过" },
  { title: "资质审核", description: "材料不齐，被打回" },
  { title: "签署合同", description: "等待中" },
];

const errorAt = 1;

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot count={steps.length} defaultValue={1} statuses={{ [errorAt]: "error" }}>
      {({ value }) => (
        <>
          <XhStepsList>
            {steps.map((s, i) => (
              <XhStepsItem key={s.title} value={i}>
                <XhStepsTrigger>
                  <XhStepsIndicator>
                    {i === errorAt ? <XhIcon icon={XIcon} /> : value > i ? "" : i + 1}
                  </XhStepsIndicator>
                  <XhStepsTitle>{s.title}</XhStepsTitle>
                  <XhStepsDescription>{s.description}</XhStepsDescription>
                </XhStepsTrigger>
                <XhStepsSeparator />
              </XhStepsItem>
            ))}
          </XhStepsList>

          <XhStepsContent value={0}>材料已提交。</XhStepsContent>
          <XhStepsContent value={1}>请补充营业执照副本。</XhStepsContent>
          <XhStepsContent value={2}>等待签署合同。</XhStepsContent>
          <XhStepsContent value={steps.length}>流程已完成。</XhStepsContent>
        </>
      )}
    </XhStepsRoot>
  );
}
