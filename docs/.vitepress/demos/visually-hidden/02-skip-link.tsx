// 跳转链接 | 打开 focusable：平时藏着，按 Tab 进来时显出，按下直达正文
import type { ReactNode } from "react";
import { XhButton, XhTypographyLink, XhTypographyParagraph, XhTypographyRoot, XhVisuallyHidden } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhVisuallyHidden focusable>
        <XhButton as="a" href="#visually-hidden-skip-main">跳到正文</XhButton>
      </XhVisuallyHidden>
      <XhTypographyRoot>
        <XhTypographyParagraph>
          <XhTypographyLink href="#/">首页</XhTypographyLink>
          {" · "}
          <XhTypographyLink href="#/">组件</XhTypographyLink>
          {" · "}
          <XhTypographyLink href="#/">设计令牌</XhTypographyLink>
        </XhTypographyParagraph>
        <XhTypographyParagraph id="visually-hidden-skip-main">
          正文从这里开始。用键盘浏览时，跳转链接让人不必逐个按过导航里的每一项。
        </XhTypographyParagraph>
      </XhTypographyRoot>
    </>
  );
}
