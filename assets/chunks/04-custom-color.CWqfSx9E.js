const t=`// 自定义颜色 | 设置水印前景色
import type { CSSProperties, ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhWatermarkRoot text="机密" style={{ "--xh-watermark-fg": "var(--xh-fg-danger)" } as CSSProperties}>
      <XhWatermarkContent>
        <div style={{ inlineSize: "320px", padding: "32px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <strong>财务摘要</strong>
          <p style={{ marginBlockEnd: 0 }}>仅限授权成员查看。</p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  );
}
`;export{t as default};
