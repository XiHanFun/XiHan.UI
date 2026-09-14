// 运行态与播报 | status 由宿主持有，组件只把它透出成 root 上的 data-state；播报只发生在 live-region 里，一轮结束才写一句
import type { ReactNode } from "react";
import {
  XhButton,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

type Status = "idle" | "submitted" | "streaming" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  who: string;
  text: string;
}

const first: Message = { id: "m1", role: "user", who: "我", text: "帮我写一段开场白。" };

export default function Demo(): ReactNode {
  const [messages, setMessages] = useState<Message[]>([first]);
  const [status, setStatus] = useState<Status>("idle");
  // 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
  const [announcement, setAnnouncement] = useState("");

  const timer = useRef(0);

  function run(): void {
    window.clearTimeout(timer.current);
    setMessages([first]);
    setAnnouncement("");
    setStatus("submitted");

    timer.current = window.setTimeout(() => {
      setStatus("streaming");
      setMessages([
        first,
        { id: "m2", role: "assistant", who: "助手", text: "好的，正在往下写…" },
      ]);

      timer.current = window.setTimeout(() => {
        const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
        setMessages([first, { id: "m2", role: "assistant", who: "助手", text }]);
        setStatus("idle");
        // 一轮结束时一次性写进播报区
        setAnnouncement(text);
      }, 1200);
    }, 600);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhMessageFeedRoot count={messages.length} status={status} style={{ blockSize: "200px" }}>
        <XhMessageFeedViewport>
          <XhMessageFeedList>
            {messages.map((message, index) => (
              <XhMessageFeedItem
                key={message.id}
                itemId={message.id}
                itemIndex={index}
                itemRole={message.role}
                itemStreaming={status === "streaming" && index === messages.length - 1}
              >
                <XhMessageFeedItemLabel>{message.who}</XhMessageFeedItemLabel>
                <div>{message.text}</div>
              </XhMessageFeedItem>
            ))}
          </XhMessageFeedList>
        </XhMessageFeedViewport>
        <XhMessageFeedLiveRegion>{announcement}</XhMessageFeedLiveRegion>
      </XhMessageFeedRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton variant="solid" onClick={run}>跑一轮</XhButton>
        <XhButton variant="outline" onClick={() => setStatus("error")}>置为 error</XhButton>
        <span>{`status：${status}`}</span>
      </div>
    </div>
  );
}
