const n=`// 基础用法 | 块列表由宿主用流式渲染器得到，组件只按 key 铺开、按种类分流
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/react";

const article = \`## 结论

先给**结论**：这段正文是一次性渲好的。

- 块列表由渲染器产出
- 每块带一个稳定的 key
\`;

// 渲染器是有状态的，谁持有谁负责：一个实例只喂同一条消息的全文
const renderer = createStreamRenderer();
const blocks = renderer.render(article, { ended: true }) as readonly MarkdownBlock[];

export default function Demo(): ReactNode {
  return (
    <XhMarkdownStreamRoot blocks={blocks} style={{ inlineSize: "100%" }}>
      <XhMarkdownStreamContent />
    </XhMarkdownStreamRoot>
  );
}
`;export{n as default};
