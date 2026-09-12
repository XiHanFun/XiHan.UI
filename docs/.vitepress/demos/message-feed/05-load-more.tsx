// 触底加载更多 | stick-change 报到底，宿主据此去取下一页；先往上翻一段再滚回底部，取回来的消息接在后面
import type { MessageFeedStickChangeDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const maxPage = 3;

export default function Demo(): ReactNode {
  const [messages, setMessages] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: `m${i + 1}`,
      text: `第 ${i + 1} 条 · 先往上翻一段，再滚回底部`,
    })),
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 到了底、手上没在取、还有下一页，三条都满足才发起这一次加载
  function onStickChange(details: MessageFeedStickChangeDetails): void {
    if (!details.atBottom || loading || page >= maxPage)
      return;
    setLoading(true);
    const next = page + 1;
    window.setTimeout(() => {
      setPage(next);
      setMessages((list) => {
        const base = list.length;
        return [
          ...list,
          ...Array.from({ length: 4 }, (_, i) => ({
            id: `m${base + i + 1}`,
            text: `第 ${base + i + 1} 条 · 第 ${next} 页取回来的`,
          })),
        ];
      });
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {/* 提示行不是消息，摆在列表外面：条目必须是 list 的直接子节点 */}
      <XhMessageFeedRoot
        count={messages.length}
        style={{ blockSize: "220px" }}
        onStickChange={onStickChange}
      >
        <XhMessageFeedViewport>
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
        {`已加载 ${messages.length} 条 · 第 ${page} / ${maxPage} 页`}
        {loading ? "· 正在取下一页…" : null}
        {!loading && page >= maxPage ? "· 没有更多了" : null}
      </span>
    </div>
  );
}
