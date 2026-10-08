var e=`// 消息动作条 | 每条消息下挂一条工具条：复制交给剪贴板；重新生成、编辑重发、切换分支、失败重试与截断续写各是会话容器 createThreadStore 上的一个方法，界面只照快照渲染
import type { ThreadSnapshot, ThreadStore, Transport, UIMessage } from "@xihan-ui/chat-stream";
import type { ReactNode } from "react";
import { asBlockKey, createThreadStore } from "@xihan-ui/chat-stream";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  PlayIcon,
  RefreshIcon,
  RotateRightIcon,
} from "@xihan-ui/icons";
import {
  XhButton,
  XhClipboardRoot,
  XhIcon,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedPendingIndicator,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhToolbarItem,
  XhToolbarRoot,
} from "@xihan-ui/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function textOf(message: UIMessage): string {
  return message.parts.map(part => (part.type === "text" ? part.text : "")).join("");
}
function errorOf(message: UIMessage): string {
  return message.parts.map(part => (part.type === "error" ? part.errorText : "")).join("");
}

// 演示用的传输：按提问拼一段回复逐字吐出。接真实后端时换成 createHttpSseTransport，
// 请求里的 trigger 与 messageId 告诉服务端这一轮是新提问、重新生成、重试、编辑还是续写
const drafts = [
  (q: string) => \`关于「\${q}」：先确认范围，再列出依赖，最后逐项核对，每一步做完都留一条记录。\`,
  (q: string) => \`换个角度看「\${q}」：把不确定的部分先问清楚，其余照清单推进，卡住就回到第一步。\`,
  (q: string) => \`简短版：围绕「\${q}」，先做最小可行的那一步，再按反馈补齐。\`,
];

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    // 取消时不抛：传输按约定自己收手，结束方式由会话容器记为 aborted
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

function createDemoTransport(shouldFail: () => boolean): Transport {
  // 每条回复本该写完的全文：续写从截断处接着吐
  const fullText = new Map<string, string>([["a1", "发布前冻结改动、跑完回归，发布后盯住告警。"]]);
  let replies = 0;
  return {
    async* stream(request, signal) {
      await wait(400, signal);
      if (signal.aborted)
        return;
      if (shouldFail()) {
        yield { kind: "error", errorText: "网络中断，这一轮没有完成。", receivedTime: Date.now() };
        return;
      }
      const last = request.messages[request.messages.length - 1]!;
      let text: string;
      if (request.trigger === "continue") {
        text = (fullText.get(last.id) ?? "").slice(textOf(last).length);
      }
      else {
        replies += 1;
        const id = \`reply-\${replies}\`;
        text = drafts[(replies - 1) % drafts.length]!(textOf(last));
        fullText.set(id, text);
        yield { kind: "message-start", messageId: id, role: "assistant", receivedTime: Date.now() };
      }
      const block = asBlockKey("text");
      yield { kind: "text-start", block, receivedTime: Date.now() };
      for (let i = 0; i < text.length; i += 2) {
        await wait(80, signal);
        if (signal.aborted)
          return;
        yield { kind: "text-delta", block, delta: text.slice(i, i + 2), receivedTime: Date.now() };
      }
      yield { kind: "text-end", block, receivedTime: Date.now() };
      yield { kind: "finish", receivedTime: Date.now() };
    },
  };
}

const followUps = ["发布前要冻结哪些改动？", "回滚预案怎么写？"];

function Actions({ store, snapshot, message, index, onEdit }: {
  store: ThreadStore;
  snapshot: ThreadSnapshot;
  message: UIMessage;
  index: number;
  onEdit: () => void;
}): ReactNode {
  const running = snapshot.status === "submitted" || snapshot.status === "streaming";
  const last = index === snapshot.messages.length - 1;
  const branch = snapshot.branches[message.id];
  return (
    <XhToolbarRoot size="sm" aria-label={message.role === "user" ? "提问操作" : "回复操作"}>
      {/* 复制交给剪贴板：根的子函数给出 copy 与 copied，按钮仍是工具条的一项，方向键照常走到它 */}
      {message.role === "assistant" && textOf(message) !== "" && (
        <XhClipboardRoot value={textOf(message)}>
          {({ copy, copied }) => (
            <XhToolbarItem value="copy" type="button" onClick={copy}>
              <XhIcon icon={copied ? CheckIcon : CopyIcon} />
              {copied ? " 已复制" : " 复制"}
            </XhToolbarItem>
          )}
        </XhClipboardRoot>
      )}
      {message.role === "assistant" && message.status !== "error" && (
        <XhToolbarItem value="regenerate" type="button" disabled={running} onClick={() => store.regenerate(message.id)}>
          <XhIcon icon={RefreshIcon} />
          {" 重新生成"}
        </XhToolbarItem>
      )}
      {message.role === "user" && (
        <XhToolbarItem value="edit" type="button" disabled={running} onClick={onEdit}>
          <XhIcon icon={PencilIcon} />
          {" 编辑"}
        </XhToolbarItem>
      )}
      {message.status === "error" && last && (
        <XhToolbarItem value="retry" type="button" onClick={() => store.retry()}>
          <XhIcon icon={RotateRightIcon} />
          {" 重试"}
        </XhToolbarItem>
      )}
      {message.status === "aborted" && last && (
        <XhToolbarItem value="continue" type="button" onClick={() => store.continue(message.id)}>
          <XhIcon icon={PlayIcon} />
          {" 续写"}
        </XhToolbarItem>
      )}
      {/* 分支切换：同一位置上有几条候选，就能在它们之间来回换 */}
      {branch !== undefined && branch.count > 1 && (
        <>
          <XhToolbarItem
            value="previous"
            type="button"
            aria-label="上一个版本"
            disabled={running || branch.index === 0}
            onClick={() => store.selectBranch(message.id, branch.index - 1)}
          >
            <XhIcon icon={ChevronLeftIcon} style={{ scale: "var(--xh-direction-sign) 1" }} />
          </XhToolbarItem>
          <span>{\`\${branch.index + 1} / \${branch.count}\`}</span>
          <XhToolbarItem
            value="next"
            type="button"
            aria-label="下一个版本"
            disabled={running || branch.index === branch.count - 1}
            onClick={() => store.selectBranch(message.id, branch.index + 1)}
          >
            <XhIcon icon={ChevronRightIcon} style={{ scale: "var(--xh-direction-sign) 1" }} />
          </XhToolbarItem>
        </>
      )}
    </XhToolbarRoot>
  );
}

export default function Demo(): ReactNode {
  const [failNext, setFailNext] = useState(false);
  const failRef = useRef(false);
  const [store] = useState(() => createThreadStore({
    transport: createDemoTransport(() => {
      const fail = failRef.current;
      failRef.current = false;
      if (fail)
        setFailNext(false);
      return fail;
    }),
    messages: [
      { id: "q1", role: "user", parts: [{ type: "text", text: "怎么准备一次发布？" }] },
      { id: "a1", role: "assistant", status: "complete", parts: [{ type: "text", text: "发布前冻结改动、跑完回归，发布后盯住告警。" }] },
    ],
  }));
  useEffect(() => () => store.dispose(), [store]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const asked = useRef(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const running = snapshot.status === "submitted" || snapshot.status === "streaming";

  // 编辑：改写的那条留在原位，新写法成为同一位置上的另一个分支
  function send(id: string): void {
    if (draft.trim() !== "")
      store.edit(id, draft.trim());
    setEditing(null);
  }

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <XhMessageFeedRoot count={snapshot.messages.length} status={snapshot.status} style={{ blockSize: "360px" }}>
        <XhMessageFeedViewport>
          <XhMessageFeedList>
            {snapshot.messages.map((message, index) => (
              <XhMessageFeedItem
                key={message.id}
                itemId={message.id}
                itemIndex={index}
                itemRole={message.role === "user" ? "user" : "assistant"}
                itemStreaming={message.status === "streaming"}
              >
                <XhMessageFeedItemLabel>{message.role === "user" ? "我" : "助手"}</XhMessageFeedItemLabel>
                {editing === message.id
                  ? (
                      <div style={{ display: "grid", gap: "8px" }}>
                        <XhTextFieldRoot value={draft} onValueChange={details => setDraft(details.value)}>
                          <XhTextFieldLabel>改写这条提问</XhTextFieldLabel>
                          <XhTextFieldControl>
                            <XhTextFieldInput />
                          </XhTextFieldControl>
                        </XhTextFieldRoot>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <XhButton size="sm" onClick={() => send(message.id)}>发送</XhButton>
                          <XhButton size="sm" variant="ghost" onClick={() => setEditing(null)}>取消</XhButton>
                        </div>
                      </div>
                    )
                  : (
                      <>
                        <div>{textOf(message)}</div>
                        {message.status === "error" && <div>{errorOf(message)}</div>}
                        {message.status === "aborted" && <div>（已停止）</div>}
                        {/* 动作条只在这条写完之后出现：生成中的那条没有可操作的内容 */}
                        {message.status !== "streaming" && (
                          <Actions
                            store={store}
                            snapshot={snapshot}
                            message={message}
                            index={index}
                            onEdit={() => {
                              setEditing(message.id);
                              setDraft(textOf(message));
                            }}
                          />
                        )}
                      </>
                    )}
              </XhMessageFeedItem>
            ))}
          </XhMessageFeedList>
          <XhMessageFeedPendingIndicator />
        </XhMessageFeedViewport>
      </XhMessageFeedRoot>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <XhButton
          disabled={running}
          onClick={() => {
            store.submit(followUps[asked.current % followUps.length]!);
            asked.current += 1;
          }}
        >
          追问一句
        </XhButton>
        <XhButton variant="outline" disabled={!running} onClick={() => store.stop()}>停止</XhButton>
        <XhButton
          variant="ghost"
          disabled={failNext}
          onClick={() => {
            failRef.current = true;
            setFailNext(true);
          }}
        >
          {failNext ? "下一轮会失败" : "让下一轮失败"}
        </XhButton>
      </div>
    </div>
  );
}
`;export{e as default};