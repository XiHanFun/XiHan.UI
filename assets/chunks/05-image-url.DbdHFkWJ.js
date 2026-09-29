const t=`// 图片地址 | 同源或放行了跨域的地址先取回再印出剪影
import type { ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhWatermarkRoot text="XiHan" image="/images/demo-avatar.svg" imageSize={{ width: 40, height: 40 }}>
      <XhWatermarkContent>
        <div style={{ inlineSize: "320px", padding: "24px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <strong>设计稿预览</strong>
          <p style={{ marginBlockEnd: 0 }}>预览版本仅供内部评审，请勿外传。</p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  );
}
`;export{t as default};
