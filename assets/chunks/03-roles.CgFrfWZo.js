const e=`// 按角色分侧 | 条目上带 data-role，左右分侧与气泡在使用者这一侧写，组件不预设这层外观
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
  { id: "m1", role: "user" as const, who: "我", text: "帮我把上面那段改成三句话。" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "好的，三句话的版本如下，保留了原来的结论顺序。" },
  { id: "m3", role: "user" as const, who: "我", text: "第二句再短一点。" },
  { id: "m4", role: "assistant" as const, who: "助手", text: "已经把第二句压到十二个字，其余不动。" },
];

// 用户侧靠右成气泡，助手侧整行铺开
const bubble = {
  alignSelf: "flex-end",
  maxInlineSize: "75%",
  padding: "var(--xh-space-2) var(--xh-space-3)",
  background: "var(--xh-bg-subtle)",
  borderRadius: "var(--xh-shape-surface)",
};

export default function Demo(): ReactNode {
  return (
    <XhMessageFeedRoot count={messages.length} style={{ blockSize: "260px" }}>
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          {messages.map((message, index) => (
            <XhMessageFeedItem
              key={message.id}
              itemId={message.id}
              itemIndex={index}
              itemRole={message.role}
              style={message.role === "user" ? bubble : undefined}
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
