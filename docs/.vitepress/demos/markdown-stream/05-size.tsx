// 尺寸 | size 换正文字号与块间距，三档共用同一份块列表
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/react";

const article = `## 结论

先给**结论**：这段正文是一次性渲好的。
`;

const renderer = createStreamRenderer();
const blocks = renderer.render(article, { ended: true }) as readonly MarkdownBlock[];

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {sizes.map(size => (
        <XhMarkdownStreamRoot
          key={size}
          blocks={blocks}
          size={size}
          style={{ inlineSize: "100%" }}
        >
          <XhMarkdownStreamContent />
        </XhMarkdownStreamRoot>
      ))}
    </div>
  );
}
