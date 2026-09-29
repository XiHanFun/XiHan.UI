const e=`// 聊天流 | anchor 设为 end：从最新一条看起，贴底时新消息继续贴底；往前翻出历史时，给了 getItemKey 视口不跳
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
}

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "12px",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
};

export default function Demo(): ReactNode {
  const ids = useRef({ oldest: 0, newest: 30 });
  const [messages, setMessages] = useState<Message[]>(() =>
    Array.from({ length: 30 }, (_, id) => ({ id, text: \`消息 \${id}\` })),
  );

  // 历史往前插：身份是消息 id，原来视口里第一条留在原处
  const loadOlder = (): void => {
    const older = Array.from({ length: 20 }, () => {
      ids.current.oldest -= 1;
      return { id: ids.current.oldest, text: \`历史 \${-ids.current.oldest}\` };
    }).reverse();
    setMessages(current => [...older, ...current]);
  };

  const send = (): void => {
    const id = ids.current.newest++;
    setMessages(current => [...current, { id, text: \`消息 \${id}\` }]);
  };

  return (
    <div style={{ display: "grid", gap: 8, inlineSize: "100%", maxInlineSize: 420 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <XhButton size="sm" variant="outline" onClick={loadOlder}>加载更早</XhButton>
        <XhButton size="sm" onClick={send}>发送一条</XhButton>
      </div>
      <XhVirtualizerRoot
        count={messages.length}
        estimateSize={36}
        getItemKey={index => messages[index]!.id}
        anchor="end"
        style={{ blockSize: "240px" }}
      >
        {({ virtualItems }) => (
          <XhVirtualizerViewport>
            <XhVirtualizerContent>
              {virtualItems.map(item => (
                <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                  {messages[item.index]!.text}
                </XhVirtualizerItem>
              ))}
            </XhVirtualizerContent>
          </XhVirtualizerViewport>
        )}
      </XhVirtualizerRoot>
    </div>
  );
}
`;export{e as default};
