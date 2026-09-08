// 语气 | tone 决定已完成与当前这两步的标记、连接线用哪族颜色；示例预置到第 2 步，第 1 步已走完
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", inlineSize: "100%" }}>
      {tones.map(t => (
        <div key={t}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{t}</div>
          <XhStepsRoot
            tone={t}
            count={steps.length}
            defaultValue={1}
            style={{ inlineSize: "100%" }}
          >
            <XhStepsList>
              {steps.map((s, i) => (
                <XhStepsItem key={s.title} value={i}>
                  <XhStepsTrigger>
                    <XhStepsIndicator>{i === 0 ? "" : i + 1}</XhStepsIndicator>
                    <XhStepsTitle>{s.title}</XhStepsTitle>
                    <XhStepsDescription>{s.description}</XhStepsDescription>
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
        </div>
      ))}
    </div>
  );
}
