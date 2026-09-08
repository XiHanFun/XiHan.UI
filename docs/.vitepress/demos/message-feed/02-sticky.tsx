// 粘底跟随与播报 | 新消息长出来时自动到底，往上翻就解除；一轮结束在播报区念一句
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

export default function Demo(): ReactNode {
  const [messages, setMessages] = useState([
    { id: "m0", text: "第 1 条：往上翻一下，粘附会解除，右下角出现回到底部。" },
  ]);
  const [announcement, setAnnouncement] = useState("");
  const [, setSticking] = useState(true);

  // 效应里才起：模块顶层在服务端渲染时也执行，那里没有 window
  useEffect(() => {
    let timer = 0;
    let n = 1;
    function tick(): void {
      n += 1;
      const id = `m${n}`;
      setMessages(list => [...list, { id, text: `第 ${n} 条：内容还在长。` }]);
      setAnnouncement(`已收到 ${n} 条消息`);
      if (n < 12)
        timer = window.setTimeout(tick, 1200);
    }
    timer = window.setTimeout(tick, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <XhMessageFeedRoot
      count={messages.length}
      status="streaming"
      style={{ blockSize: "220px" }}
      onStickChange={details => setSticking(details.sticking)}
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
      {/* 一份会话只该有这一个活区：每条消息各开一个会互相打断 */}
      <XhMessageFeedLiveRegion>{announcement}</XhMessageFeedLiveRegion>
    </XhMessageFeedRoot>
  );
}
