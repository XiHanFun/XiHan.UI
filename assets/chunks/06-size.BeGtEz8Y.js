const e=`// 尺寸 | size 换序号圆点的直径与标题、说明的字号，不传 size 即默认档
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

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", inlineSize: "100%" }}>
      {sizes.map(s => (
        <div key={s.label}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{s.label}</div>
          <XhStepsRoot
            size={s.size}
            count={steps.length}
            defaultValue={1}
            style={{ inlineSize: "100%" }}
          >
            <XhStepsList>
              {steps.map((item, i) => (
                <XhStepsItem key={item.title} value={i}>
                  <XhStepsTrigger>
                    <XhStepsIndicator>{i === 0 ? "" : i + 1}</XhStepsIndicator>
                    <XhStepsTitle>{item.title}</XhStepsTitle>
                    <XhStepsDescription>{item.description}</XhStepsDescription>
                  </XhStepsTrigger>
                  <XhStepsSeparator />
                </XhStepsItem>
              ))}
            </XhStepsList>

            {steps.map((item, i) => (
              <XhStepsContent key={item.title} value={i}>
                {\`面板 \${i + 1}：\${item.title}\`}
              </XhStepsContent>
            ))}
            <XhStepsContent value={steps.length}>全部完成。</XhStepsContent>
          </XhStepsRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
