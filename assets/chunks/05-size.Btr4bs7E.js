const e=`// 尺寸 | size 换字号、行高与行号槽的宽度，三档并列对照
import type { ReactNode } from "react";
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/react";

const before = \`export function clamp(n: number, min: number) {
  return Math.max(n, min)
}\`;

const after = \`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}\`;

const model = computeTextDiff(before, after);

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {sizes.map(size => (
        <XhDiffViewRoot key={size} model={model} size={size}>
          <XhDiffViewHeader>{\`src/clamp.ts · \${size}\`}</XhDiffViewHeader>
          <XhDiffViewViewport>
            <XhDiffViewBody />
          </XhDiffViewViewport>
        </XhDiffViewRoot>
      ))}
    </div>
  );
}
`;export{e as default};
