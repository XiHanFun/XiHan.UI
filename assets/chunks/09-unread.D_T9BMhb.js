var e=`// 回到底部带未读数 | 离开底部期间新到的消息记成未读，数字挂在回到底部按钮上并进入它的可访问名；回到底部即清零
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedUnreadCount,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

const initial = Array.from({ length: 8 }, (_, index) => ({
  id: \`m\${index + 1}\`,
  text: index === 0 ? "第 1 条：往上翻，之后到的消息会记成未读。" : \`第 \${index + 1} 条消息。\`,
}));

export default function Demo(): ReactNode {
  const [messages, setMessages] = useState(initial);

  // 效应里才起：模块顶层在服务端渲染时也执行，那里没有 window
  useEffect(() => {
    let timer = 0;
    let n = initial.length;
    function tick(): void {
      n += 1;
      const id = \`m\${n}\`;
      const text = \`第 \${n} 条消息。\`;
      setMessages(list => [...list, { id, text }]);
      if (n < 30)
        timer = window.setTimeout(tick, 2000);
    }
    timer = window.setTimeout(tick, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <XhMessageFeedRoot count={messages.length} style={{ blockSize: "240px" }}>
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
      <XhMessageFeedScrollToEndTrigger>
        <XhMessageFeedUnreadCount />
      </XhMessageFeedScrollToEndTrigger>
    </XhMessageFeedRoot>
  );
}
`;export{e as default};