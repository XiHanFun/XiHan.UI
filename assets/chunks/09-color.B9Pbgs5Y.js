const e=`// 换色 | 颜色不是 props，写三个 CSS 变量即可：码点必须比底色深且对比充足，反相码部分读码器不识别
import type { CSSProperties, ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";

const text = "https://ui.xihanfun.com";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode value={text} pixelSize={128} />
        <span style={{ fontSize: "12px" }}>缺省</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        {/* 只换码点色，码眼跟着走 */}
        <XhMatrixCode value={text} pixelSize={128} style={{ "--xh-matrix-code-fg": "#1d4ed8" } as CSSProperties} />
        <span style={{ fontSize: "12px" }}>深蓝码点</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        {/* 码眼单独挑一个色，挖空矩形跟着底色走，两处必须一致 */}
        <XhMatrixCode
          value={text}
          pixelSize={128}
          eyeShape="rounded"
          style={{
            "--xh-matrix-code-bg": "#fff7ed",
            "--xh-matrix-code-fg": "#431407",
            "--xh-matrix-code-eye-fg": "#c2410c",
          } as CSSProperties}
        />
        <span style={{ fontSize: "12px" }}>暖底 + 独立码眼色</span>
      </div>
    </div>
  );
}
`;export{e as default};
