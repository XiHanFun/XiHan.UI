// 流式光标 | 尚未收到任何块时光标就已存在，caret 设为 false 可以整个关闭
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/react";

// 生长中的那一块 key 恒为 live，光标贴在正文最后一个字后面
const growing: readonly MarkdownBlock[] = [
  { key: "live", kind: "markdown", html: "<p>正在写的这一句。</p>", complete: false },
];

const cases: { label: string; blocks: readonly MarkdownBlock[]; caret: boolean }[] = [
  { label: "等第一个字：块列表还是空的", blocks: [], caret: true },
  { label: "正在出字：光标贴在最后一个字后面", blocks: growing, caret: true },
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
