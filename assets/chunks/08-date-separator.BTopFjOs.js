const e=`// 按日期分隔 | 跨天的消息之间放一条 separator，与条目平级写在列表里；它对读屏隐藏，时间由消息自己的时间戳表达
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedSeparator,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { Fragment } from "react";

const messages = [
  { id: "m1", day: "9 月 27 日", time: "21:40", role: "user" as const, who: "我", text: "明天的发布清单整理好了吗？" },
  { id: "m2", day: "9 月 27 日", time: "21:41", role: "assistant" as const, who: "助手", text: "整理好了，一共 12 项，明早再核一遍。" },
  { id: "m3", day: "今天", time: "09:02", role: "user" as const, who: "我", text: "开始核对吧。" },
  { id: "m4", day: "今天", time: "09:02", role: "assistant" as const, who: "助手", text: "第 1 项：构建产物已上传。" },
];

export default function Demo(): ReactNode {
  return (
    <XhMessageFeedRoot count={messages.length} style={{ blockSize: "280px" }}>
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          {messages.map((message, index) => (
            <Fragment key={message.id}>
              {/* 一天的第一条消息前面放一条分隔 */}
              {(index === 0 || messages[index - 1]!.day !== message.day) && (
                <XhMessageFeedSeparator>{message.day}</XhMessageFeedSeparator>
              )}
              <XhMessageFeedItem itemId={message.id} itemIndex={index} itemRole={message.role}>
                <XhMessageFeedItemLabel>{\`\${message.who} · \${message.time}\`}</XhMessageFeedItemLabel>
                <div>{message.text}</div>
              </XhMessageFeedItem>
            </Fragment>
          ))}
        </XhMessageFeedList>
      </XhMessageFeedViewport>
    </XhMessageFeedRoot>
  );
}
`;export{e as default};
