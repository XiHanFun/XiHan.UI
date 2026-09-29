const n=`// 按块折叠 | block-folding 按缩进找出语法块，块头行首给一颗折叠钮；折叠集合写块头的行号，可受控（folded）也可非受控（default-folded）；一组钮只占一个 Tab 位、上下方向键在组内走
import type { ReactNode } from "react";
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/react";
import { useState } from "react";

const sample = \`export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}\`;

export default function Demo(): ReactNode {
  // 受控写法：folded 与 onFoldedChange 拿到折叠着的块头行号
  const [folded, setFolded] = useState<number[]>([11]);
  return (
    <div style={{ display: "grid", gap: "8px", inlineSize: "100%" }}>
      <XhCodeViewRoot
        code={sample}
        lang="typescript"
        complete
        lineNumbers
        blockFolding
        folded={folded}
        onFoldedChange={details => setFolded(details.folded)}
      >
        <XhCodeViewPre>
          <XhCodeViewCode />
        </XhCodeViewPre>
      </XhCodeViewRoot>
      <span>{\`折叠着的块头：\${folded.length > 0 ? folded.join("、") : "无"}\`}</span>
    </div>
  );
}
`;export{n as default};
