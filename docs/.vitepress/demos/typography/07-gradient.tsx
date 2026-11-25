// 渐变字 | 为标题里的关键词铺品牌渐变；tone 换成语气色板，覆盖槽改写两端颜色与走向
import type { CSSProperties, ReactNode } from "react";
import { XhTypographyHeading, XhTypographyRoot, XhTypographyText } from "@xihan-ui/react";
import { Fragment } from "react";

const tones = [
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      <XhTypographyHeading as="h2" level={1}>
        快速、轻量的
        <XhTypographyText variant="gradient">Headless 组件库</XhTypographyText>
      </XhTypographyHeading>
      <XhTypographyHeading level={3}>
        {tones.map((item, index) => (
          <Fragment key={item.tone}>
            {index > 0 ? " · " : null}
            <XhTypographyText variant="gradient" tone={item.tone}>{item.label}</XhTypographyText>
          </Fragment>
        ))}
      </XhTypographyHeading>
      <XhTypographyHeading level={3}>
        <XhTypographyText
          variant="gradient"
          style={{
            "--xh-typography-gradient-from": "var(--xh-color-orange-500)",
            "--xh-typography-gradient-to": "var(--xh-color-pink-500)",
          } as CSSProperties}
        >
          日落橙
        </XhTypographyText>
        {" · "}
        <XhTypographyText
          variant="gradient"
          style={{
            "--xh-typography-gradient-from": "var(--xh-color-purple-500)",
            "--xh-typography-gradient-to": "var(--xh-color-cyan-500)",
            "--xh-typography-gradient-direction": "to bottom right",
          } as CSSProperties}
        >
          极光紫
        </XhTypographyText>
      </XhTypographyHeading>
    </XhTypographyRoot>
  );
}
