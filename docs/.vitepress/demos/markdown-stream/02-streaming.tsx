// 流式增长 | 只有生长中的那一块每帧重渲，定型的块 key 不变、节点原地留着，选区与滚动位置才保得住
import type { MarkdownBlock } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamLiveRegion, XhMarkdownStreamRoot } from "@xihan-ui/react";
import { useEffect, useState } from "react";

const article = `## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;

export default function Demo(): ReactNode {
  const [blocks, setBlocks] = useState<readonly MarkdownBlock[]>([]);
  const [streaming, setStreaming] = useState(true);

  // 挂载后才开始追加：组件函数体在服务端渲染时也执行，那里没有 window
  useEffect(() => {
    const renderer = createStreamRenderer();
    let at = 0;
    let timer = 0;
    function tick(): void {
      at = Math.min(at + 3, article.length);
      const ended = at >= article.length;
      setBlocks(renderer.render(article.slice(0, at), { ended }) as readonly MarkdownBlock[]);
      setStreaming(!ended);
      if (!ended)
        timer = window.setTimeout(tick, 70);
    }
    tick();

    return () => {
      window.clearTimeout(timer);
      renderer.dispose();
    };
  }, []);

  return (
    // announce 开着，写完那一刻在播报区念一句；还在写的时候不念
    <XhMarkdownStreamRoot
      blocks={blocks}
      streaming={streaming}
      announce="polite"
      style={{ inlineSize: "100%" }}
    >
      <XhMarkdownStreamContent />
      <XhMarkdownStreamLiveRegion />
    </XhMarkdownStreamRoot>
  );
}
