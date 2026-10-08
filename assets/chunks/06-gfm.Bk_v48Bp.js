var e=`// GFM 扩展 | 任务列表、脚注与裸地址自动成链：渲染器按 GFM 认出它们，脚注角标按首次引用编号并链到文末定义
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/react";

const article = \`发布前的检查[^1]：

- [x] 构建通过
- [x] 门禁通过
- [ ] 更新日志

详见 https://ui.docs.xihanfun.com 的发版说明。

[^1]: 按仓库的发版流程逐项确认。
\`;

// 同一页上有几段正文带脚注时各传一个 idPrefix，锚点才不会串到别的消息上
const renderer = createStreamRenderer({ idPrefix: "release-" });
const blocks = renderer.render(article, { ended: true }) as readonly MarkdownBlock[];

export default function Demo(): ReactNode {
  return (
    <XhMarkdownStreamRoot blocks={blocks} style={{ inlineSize: "100%" }}>
      <XhMarkdownStreamContent />
    </XhMarkdownStreamRoot>
  );
}
`;export{e as default};