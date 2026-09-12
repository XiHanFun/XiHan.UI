const e=`// 基础用法 | 消息内容全由作者写；组件管的是集合语义、粘底与那一个播报区
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/react";

const messages = [
  { id: "m1", role: "user" as const, who: "我", text: "这个组件负责什么？" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "集合语义、粘底跟随，以及一个统一的播报区。" },
  { id: "m3", role: "user" as const, who: "我", text: "气泡样式呢？" },
  { id: "m4", role: "assistant" as const, who: "助手", text: "气泡、头像、时间都由你自己写，按条目上的 data-role 出样式。" },
];

export default function Demo(): ReactNode {
  return (
    // 键盘：Tab 进来落在第一条，PageDown / PageUp 在消息之间走，Ctrl+End 一步走到流外
    <XhMessageFeedRoot count={messages.length} style={{ blockSize: "260px" }}>
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          {messages.map((message, index) => (
            <XhMessageFeedItem
              key={message.id}
              itemId={message.id}
              itemIndex={index}
              itemRole={message.role}
            >
              <XhMessageFeedItemLabel>{message.who}</XhMessageFeedItemLabel>
              <div>{message.text}</div>
            </XhMessageFeedItem>
          ))}
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>
  );
}
`;export{e as default};
