const e=`// 行号与高亮行 | 行号由皮肤画上去，复制代码不会带上它；高亮行按行号写，与 startLine 对齐
import type { ReactNode } from "react";
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/react";

const sample = \`function resolve(input: string) {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  return trimmed.toLowerCase()
}\`;

export default function Demo(): ReactNode {
  return (
    // 这段是从第 42 行摘出来的，高亮那三行是要读者看的地方
    <XhCodeViewRoot
      code={sample}
      lang="typescript"
      complete
      lineNumbers
      startLine={42}
      highlightLines="44-46"
      style={{ inlineSize: "100%" }}
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  );
}
`;export{e as default};
