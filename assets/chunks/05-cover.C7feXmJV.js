const a=`// 带封面 | 封面顶到根的边上、不吃内边距，圆角由根统一裁
import type { ReactNode } from "react";
import { XhCardBody, XhCardDescription, XhCardHeader, XhCardMedia, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCardRoot variant="elevated" style={{ maxInlineSize: "300px" }}>
      <XhCardMedia>
        <div
          style={{
            blockSize: "120px",
            background: "linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle))",
          }}
        />
      </XhCardMedia>
      <XhCardHeader>
        <XhCardTitle>七月总结</XhCardTitle>
        <XhCardDescription>封面是任意内容，放图片或自绘都行</XhCardDescription>
      </XhCardHeader>
      <XhCardBody>正文。</XhCardBody>
    </XhCardRoot>
  );
}
`;export{a as default};
