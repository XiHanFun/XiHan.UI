const e=`// 向上加载更早的消息 | 视口的滚动事件直接监听：滚到接近顶部就去取上一页，取回来的插在最前面，读到一半的位置不会被顶走
import type { ReactNode, UIEvent } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useState } from "react";

function makeRange(from: number, count: number): { id: string; text: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    id: \`m\${from + i}\`,
    text: \`第 \${from + i} 条 · 会话记录\`,
  }));
}

export default function Demo(): ReactNode {
  // 编号越小越早，取历史就是往前减
  const [earliest, setEarliest] = useState(33);
  const [messages, setMessages] = useState(() => makeRange(33, 8));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 离顶部不到 48px 就取上一页；条目是 list 的直接子节点，内容增高时滚动位置按锚点补偿
  function onScroll(event: UIEvent<HTMLDivElement>): void {
    const el = event.currentTarget;
    if (el.scrollTop > 48 || loading || !hasMore)
      return;
    setLoading(true);
    window.setTimeout(() => {
      const size = Math.min(6, earliest - 1);
      const next = earliest - size;
      setEarliest(next);
      setMessages(list => [...makeRange(next, size), ...list]);
      setHasMore(next > 1);
      setLoading(false);
    }, 500);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhMessageFeedRoot count={messages.length} style={{ blockSize: "220px" }}>
        <XhMessageFeedViewport onScroll={onScroll}>
          <XhMessageFeedList>
            {messages.map((message, index) => (
              <XhMessageFeedItem
                key={message.id}
                itemId={message.id}
                itemIndex={index}
                itemRole="assistant"
              >
                {message.text}
              </XhMessageFeedItem>
            ))}
          </XhMessageFeedList>
        </XhMessageFeedViewport>
        <XhMessageFeedScrollToEndTrigger />
      </XhMessageFeedRoot>

      <span>
        {\`已加载 \${messages.length} 条 · 最早到第 \${earliest} 条\`}
        {loading ? "· 正在取更早的…" : null}
        {!loading && !hasMore ? "· 已经是最早的了" : null}
      </span>
    </div>
  );
}
`;export{e as default};
