const e=`// 与消息流合成一个对话 | 发送键原位变停止；提交后粘底跟到最新一条，生成期间还能接着改下一句
import type { PromptInputSubmitDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  who: string;
  text: string;
}

export default function Demo(): ReactNode {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "assistant", who: "助手", text: "问点什么试试。" },
  ]);
  const [loading, setLoading] = useState(false);

  const timer = useRef(0);
  const seq = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function reply(question: string): void {
    seq.current += 1;
    const id = \`a\${seq.current}\`;
    setMessages(prev => [...prev, { id, role: "assistant", who: "助手", text: "" }]);
    const full = \`收到「\${question}」，这是一段边写边显示的回复。\`;
    let at = 0;
    const tick = (): void => {
      at = Math.min(at + 2, full.length);
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, text: full.slice(0, at) } : m)));
      if (at < full.length) {
        timer.current = window.setTimeout(tick, 60);
        return;
      }
      setLoading(false);
    };
    tick();
  }

  function onSubmit({ value }: PromptInputSubmitDetails): void {
    seq.current += 1;
    setMessages(prev => [...prev, { id: \`u\${seq.current}\`, role: "user", who: "我", text: value }]);
    setLoading(true);
    reply(value);
  }

  function onStop(): void {
    window.clearTimeout(timer.current);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", blockSize: "320px" }}>
      <XhMessageFeedRoot
        count={messages.length}
        status={loading ? "streaming" : "idle"}
        style={{ flex: 1, minBlockSize: 0 }}
      >
        <XhMessageFeedViewport>
          <XhMessageFeedList>
            {messages.map((message, index) => (
              <XhMessageFeedItem
                key={message.id}
                itemId={message.id}
                itemIndex={index}
                itemRole={message.role}
                itemStreaming={loading && index === messages.length - 1}
              >
                <XhMessageFeedItemLabel>{message.who}</XhMessageFeedItemLabel>
                <div>{message.text}</div>
              </XhMessageFeedItem>
            ))}
          </XhMessageFeedList>
        </XhMessageFeedViewport>
        <XhMessageFeedScrollToEndTrigger>↓</XhMessageFeedScrollToEndTrigger>
      </XhMessageFeedRoot>

      {/* loading 期间按钮换成停止，输入框仍可编辑：用户还要能改下一句 */}
      <XhPromptInputRoot
        loading={loading}
        translations={{ input: "给助手写点什么" }}
        onSubmit={onSubmit}
        onStop={onStop}
      >
        <XhPromptInputInput rows={1} placeholder="给助手写点什么…" />
        <XhPromptInputSubmitTrigger>{loading ? "停止" : "发送"}</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>
    </div>
  );
}
`;export{e as default};
