const e=`// 流式光标 | 一块都还没来的时候光标就已经在了，caret 设成 false 可以整个关掉
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/react";

// 生长中的那一块 key 恒为 live，光标画在它末尾
const growing: readonly MarkdownBlock[] = [
  { key: "live", kind: "markdown", html: "<p>正在写的这一句。</p>", complete: false },
];

const cases: { label: string; blocks: readonly MarkdownBlock[]; caret: boolean }[] = [
  { label: "等第一个字：块列表还是空的", blocks: [], caret: true },
  { label: "正在出字：光标停在生长块末尾", blocks: growing, caret: true },
  { label: "caret 设成 false：一竖都不画", blocks: growing, caret: false },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {cases.map(item => (
        <div key={item.label}>
          <p>{item.label}</p>
          <XhMarkdownStreamRoot blocks={item.blocks} caret={item.caret} streaming>
            <XhMarkdownStreamContent />
          </XhMarkdownStreamRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
