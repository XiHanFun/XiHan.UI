// 跳到指定的一条 | 消息 id 就是锚点：Vue 侧用 root 插槽给的 scrollToItem / focusItem，自定义元素侧按同一个 id 取节点自己滚
import type { ReactNode } from "react";
import {
  XhButton,
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const messages = Array.from({ length: 16 }, (_, i) => ({
  id: `m${i + 1}`,
  text: `第 ${i + 1} 条 · 会话记录`,
}));

export default function Demo(): ReactNode {
  const [jumped, setJumped] = useState("（还没跳过）");

  // 两个入口都收消息 id，与写在条目上的那个是同一个
  function go(jump: (id: string) => void, id: string, label: string): void {
    jump(id);
    setJumped(label);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhMessageFeedRoot count={messages.length} style={{ blockSize: "220px" }}>
        {({ scrollToItem, focusItem }) => (
          <>
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

            {/* 按钮栏排在视口下面，是 root 的直接子节点 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingBlockStart: "8px" }}>
              {/* 只滚不动焦点：读者的键盘锚点留在原处 */}
              <XhButton
                variant="outline"
                size="sm"
                onClick={() => go(scrollToItem, "m1", "滚到了第 1 条")}
              >
                滚到第 1 条
              </XhButton>
              <XhButton
                variant="outline"
                size="sm"
                onClick={() => go(scrollToItem, "m8", "滚到了第 8 条")}
              >
                滚到第 8 条
              </XhButton>
              {/* 连焦点一起挪过去：那一条随即成为 Tab 序列里的那个停靠位 */}
              <XhButton
                variant="ghost"
                size="sm"
                onClick={() => go(focusItem, "m16", "焦点落到了第 16 条")}
              >
                把焦点落到第 16 条
              </XhButton>
            </div>
          </>
        )}
      </XhMessageFeedRoot>

      <span>{jumped}</span>
    </div>
  );
}
