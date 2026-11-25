// 形态、语气与尺寸 | variant 设置正文、辅助、强调与代码样式，链接另用 link 部件；tone 使用语义颜色；size 设置正文大小
import type { ReactNode } from "react";
import {
  XhTypographyLink,
  XhTypographyParagraph,
  XhTypographyRoot,
  XhTypographyText,
} from "@xihan-ui/react";

const tones = [
  { tone: "brand", label: "品牌" },
  { tone: "success", label: "成功" },
  { tone: "warning", label: "警告" },
  { tone: "danger", label: "危险" },
  { tone: "info", label: "信息" },
] as const;

const sizes = [
  { size: "sm", label: "小号正文" },
  { size: undefined, label: "默认正文" },
  { size: "lg", label: "大号正文" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-8)" }}>
      <XhTypographyRoot>
        <XhTypographyParagraph>默认正文</XhTypographyParagraph>
        <XhTypographyParagraph><XhTypographyText variant="muted">辅助信息</XhTypographyText></XhTypographyParagraph>
        <XhTypographyParagraph><XhTypographyText variant="strong">重要内容</XhTypographyText></XhTypographyParagraph>
        <XhTypographyParagraph><XhTypographyText as="code" variant="code">pnpm add @xihan-ui/react</XhTypographyText></XhTypographyParagraph>
        <XhTypographyParagraph><XhTypographyLink href="#">查看文档</XhTypographyLink></XhTypographyParagraph>
      </XhTypographyRoot>

      <XhTypographyRoot>
        {tones.map(item => (
          <XhTypographyParagraph key={item.tone}>
            <XhTypographyText tone={item.tone}>{item.label}</XhTypographyText>
          </XhTypographyParagraph>
        ))}
      </XhTypographyRoot>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
        {sizes.map(s => (
          <XhTypographyRoot key={s.label} size={s.size}>
            <XhTypographyParagraph>{s.label}</XhTypographyParagraph>
          </XhTypographyRoot>
        ))}
      </div>
    </div>
  );
}
