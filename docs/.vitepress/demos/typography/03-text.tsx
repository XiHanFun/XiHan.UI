// 文本变体 | 设置正文、辅助、强调、代码和链接样式
import type { ReactNode } from "react";
import {
  XhTypographyLink,
  XhTypographyParagraph,
  XhTypographyRoot,
  XhTypographyText,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      <XhTypographyParagraph>默认正文</XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText variant="muted">辅助信息</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText variant="strong">重要内容</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyText as="code" variant="code">pnpm add @xihan-ui/react</XhTypographyText></XhTypographyParagraph>
      <XhTypographyParagraph><XhTypographyLink href="#">查看文档</XhTypographyLink></XhTypographyParagraph>
    </XhTypographyRoot>
  );
}
