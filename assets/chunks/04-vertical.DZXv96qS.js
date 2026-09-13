const t=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 垂直布局 | 展示纵向流程与步骤内容
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
  { title: "打包", description: "生成产物" },
  { title: "测试", description: "跑单元测试" },
  { title: "发布", description: "推到镜像仓库" },
];

export default function Demo(): ReactNode {
  return (
    <XhStepsRoot
      count={steps.length}
      defaultValue={1}
      orientation="vertical"
    >
      {({ value }) => (
        <>
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

          <XhStepsContent value={0}>查看构建产物。</XhStepsContent>
          <XhStepsContent value={1}>检查测试报告。</XhStepsContent>
          <XhStepsContent value={2}>确认发布记录。</XhStepsContent>
          <XhStepsContent value={steps.length}>流水线已完成。</XhStepsContent>
        </>
      )}
    </XhStepsRoot>
  );
}
`;export{t as default};
