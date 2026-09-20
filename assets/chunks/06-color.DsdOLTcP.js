const e=`// 换色 | 颜色不是 props，写两个 CSS 变量即可：条必须比底色深且对比充足，反相码无法扫描
import type { CSSProperties, ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

const blue = { "--xh-bar-code-fg": "#1d4ed8" } as CSSProperties;
const warm = { "--xh-bar-code-bg": "#fff7ed", "--xh-bar-code-fg": "#431407" } as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "end" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode value="COLOR" height={48} />
        <span style={{ fontSize: "12px" }}>缺省</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        {/* 只换条色，人读文字跟着走 */}
        <XhBarCode value="COLOR" height={48} style={blue} />
        <span style={{ fontSize: "12px" }}>深蓝条</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode value="COLOR" height={48} style={warm} />
        <span style={{ fontSize: "12px" }}>暖底深棕</span>
      </div>
    </div>
  );
}
`;export{e as default};
