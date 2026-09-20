const e=`// 尺寸 | size 切换字号、行高与内边距三档，行号槽与折叠按钮随之变化
import type { ReactNode } from "react";
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/react";

const sample = \`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}\`;

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {sizes.map(size => (
        <XhCodeViewRoot
          key={size}
          size={size}
          code={sample}
          lang="typescript"
          filename={\`clamp.\${size}.ts\`}
          complete
          style={{ inlineSize: "100%" }}
        >
          <XhCodeViewHeader>
            <XhCodeViewFilename />
          </XhCodeViewHeader>
          <XhCodeViewPre>
            <XhCodeViewCode />
          </XhCodeViewPre>
        </XhCodeViewRoot>
      ))}
    </div>
  );
}
`;export{e as default};
