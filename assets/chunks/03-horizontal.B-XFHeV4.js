const n=`// 横向布局 | Card 只提供内容面，方向和媒体尺寸由使用场景决定
import type { ReactNode } from "react";
import {
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCardRoot style={{ inlineSize: "100%", maxInlineSize: "520px", flexDirection: "row", alignItems: "center" }}>
      <div
        aria-hidden="true"
        style={{
          flex: "none",
          inlineSize: "120px",
          aspectRatio: 1,
          borderRadius: "var(--xh-shape-surface)",
          background: "linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle))",
        }}
      />
      <XhCardContent>
        <XhCardHeader>
          <XhCardTitle>七月总结</XhCardTitle>
          <XhCardDescription>收入与支出趋势已生成</XhCardDescription>
        </XhCardHeader>
        <XhCardFooter>更新于今天 09:30</XhCardFooter>
      </XhCardContent>
    </XhCardRoot>
  );
}
`;export{n as default};
