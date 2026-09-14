// 代码块交给代码视图 | markdown 块铺 html，代码块拿 source 交出去——照 html 渲会让同一段代码出现两次
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
} from "@xihan-ui/react";

const article = `先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`;

const renderer = createStreamRenderer();
const blocks = renderer.render(article, { ended: true }) as readonly MarkdownBlock[];

export default function Demo(): ReactNode {
  return (
    <XhMarkdownStreamRoot blocks={blocks} style={{ inlineSize: "100%" }}>
      <XhMarkdownStreamContent>
        {/* 只接管代码块，其余块留给组件按 html 铺 */}
        {({ block }) => (
          block.kind === "code"
            ? (
                <XhCodeViewRoot
                  code={block.source ?? ""}
                  lang={block.lang}
                  complete={block.complete}
                  lineNumbers
                >
                  <XhCodeViewPre>
                    <XhCodeViewCode />
                  </XhCodeViewPre>
                </XhCodeViewRoot>
              )
            : <div dangerouslySetInnerHTML={{ __html: block.html }} />
        )}
      </XhMarkdownStreamContent>
    </XhMarkdownStreamRoot>
  );
}
