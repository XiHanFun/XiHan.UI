// 点击切步与禁用某步 | 点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它
import type { ReactNode } from "react";
import {
  XhStepsContent,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const steps = [
  { title: "选择商品", disabled: false },
  { title: "确认订单", disabled: false },
  { title: "在线支付", disabled: true },
  { title: "等待发货", disabled: false },
];

export default function Demo(): ReactNode {
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhStepsRoot
        value={current}
        count={steps.length}
        onValueChange={details => setCurrent(details.value)}
      >
        <XhStepsList>
          {steps.map((s, i) => (
            <XhStepsItem key={s.title} value={i} disabled={s.disabled}>
              <XhStepsTrigger>
                <XhStepsIndicator>{current > i ? "" : i + 1}</XhStepsIndicator>
                <XhStepsTitle>{s.title}</XhStepsTitle>
              </XhStepsTrigger>
              <XhStepsSeparator />
            </XhStepsItem>
          ))}
        </XhStepsList>

        {steps.map((s, i) => (
          <XhStepsContent key={s.title} value={i}>
            {`面板 ${i + 1}：${s.title}`}
          </XhStepsContent>
        ))}
        <XhStepsContent value={steps.length}>全部完成。</XhStepsContent>
      </XhStepsRoot>

      <span>{`当前 value：${current}（第三步禁用，点它没有反应）`}</span>
    </div>
  );
}
