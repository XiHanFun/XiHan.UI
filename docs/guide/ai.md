# AI 对话内核

流式对话界面要解决三个问题：读流、收敛状态、增量渲染。XiHan.UI 把它们拆为三个互不依赖的包，均不涉及 DOM 与框架。

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/chat-stream` | SSE 读取 → 协议归一 → parts 归约 → 会话 store |
| `@xihan-ui/markdown` | 流式 Markdown 渲染：增量切块、稳定 key、消毒 |
| `@xihan-ui/code-highlight` | 代码着色，自研粗粒度词法器；可选 peer，安装后可用 |

配套的组件按职责分为四件：[消息流](../components/message-feed)渲染结构化会话，[日志](../components/log)渲染持续追加的内容，[提示输入框](../components/prompt-input)接收输入，[代码视图](../components/code-view)呈现代码。

## 数据流

```
fetch(SSE)  ──►  sse-reader  ──►  normalize  ──►  reduce  ──►  thread-store
  网络            拆帧           协议归一        parts 归约      快照 + 订阅
```

四步各负责一件事，每一步都可以单独替换或单独测试。

## 传输

```ts
import { createHttpSseTransport } from "@xihan-ui/chat-stream";

const transport = createHttpSseTransport({
  url: "/api/chat",
  headers: () => ({ authorization: `Bearer ${token}` }), // 每次请求取一次
  fetch: customFetch, // 可选
});
```

`Transport` 是一个接口，`stream(req, signal)` 返回归一化事件的异步生成器。HTTP + SSE 只是它的一个实现：换成 WebSocket 或其他协议时实现同一个接口即可，上层无需修改。

`stream()` 不抛异常。错误路径一律先产出一条事件再结束：取消产出 `abort`，其余产出 `retryable` 的 `error`。异常在流的边界转换为数据，上层不必到处 try/catch。

服务端协议按 Data Stream v1 归一（`normalizeDataStreamV1`），请求头 `x-vercel-ai-ui-message-stream: v1`。

## 消息模型

一条消息由若干 part 组成，而不是一个字符串：

```ts
type UIMessagePart
  = | TextPart // 正文
    | ReasoningPart // 思维链
    | ToolPart // 工具调用（含审批状态）
    | FilePart // 文件
    | SourcePart // 引用来源（URL / 文档 + 引文锚点）
    | DataPart // 结构化数据
    | ErrorPart
    | StepStartPart;
```

配套的类型守卫 `isTextPart` / `isToolPart` / `isSourcePart` 等按 part 类型分流渲染。消息元数据带 `TokenUsage` 与 `CostBreakdown`。

## 归约

流上传来的是增量事件，界面需要的是消息此刻的完整形态。`reduceEvent` 负责这个折叠：

```ts
import { createReduceState, reduceEvent } from "@xihan-ui/chat-stream";

let state = createReduceState();
for await (const event of transport.stream(req, signal))
  state = reduceEvent(state, event);
```

块注册表按 `BlockKey` 索引，同一个块的后续增量能找回原位：工具调用先到 `input` 后到 `output`、思维链与正文交错，都不会错位。

## 会话容器

日常使用的是封装好的 store：

```ts
import { createThreadStore } from "@xihan-ui/chat-stream";

const store = createThreadStore({
  transport,
  onData: (name, data) => {}, // 瞬态 data 帧，不进 parts
  generateId: () => crypto.randomUUID(),
});

store.subscribe((snapshot) => {
  snapshot.messages; // readonly UIMessage[]
  snapshot.status; // 'idle' | 'submitted' | 'streaming' | 'error'
  snapshot.error;
});

store.submit("你好"); // 追加 user 消息并发起运行；已有运行先被取消
store.stop(); // 取消当前运行，保留已产出的 parts
store.clear(); // 清空全部消息
store.dispose();
```

两个性能装置：

- 帧批处理（`createFrameBatcher`）：把一帧内的多次增量合并为一次通知，token 级的高频更新不会变成高频重渲染；
- 打字机（`visibleLength`）：按每秒字符数的速率计算此刻应显示到第几个字，把网络的突发抖动平摊为匀速输出。

## 流式 Markdown

```ts
import { createStreamRenderer } from "@xihan-ui/markdown";

const renderer = createStreamRenderer();

// 幂等：传入截至当前的全文，返回带稳定 key 的块列表
const blocks = renderer.render(fullText, { ended: false });
// [{ key, kind: 'markdown' | 'code' | 'math' | 'html', html, complete, lang, source }]
```

两条设计要点：

冻结前缀。文本只会向后增长，尾部保留一段前瞻余量之后，前面的块不再变化。每次只解析未冻结的部分，冻结块直接从缓存读取。否则每到一个 token 就要把整篇重新解析重新渲染，长回复到后段会明显卡顿。

唯一的例外是引用定义写在引用它的块之后：此时只把用到该标签的冻结块就地重渲染，其余不变。

稳定 key。生长中的块 key 恒为 `'live'`，定型块的 key 由下标与内容摘要拼成。生长块 key 不变，框架才会复用同一份 DOM 只改文本；每帧更换 key 时用户每收到一个 token 就重建一次节点，选区和滚动位置全部丢失。

`complete` 标记该块是否已闭合。未闭合的块随时会变，宿主据此决定是否执行高亮这类昂贵渲染。

`html` 一律已消毒，可以直接插入 DOM。渲染器只暴露这一个工厂，中间态（解析结果、切块、冻结缓存）一概不暴露：暴露后消费方迟早会绕过缓存直接修改块，增量渲染的保证随之失效。

::: tip CommonMark 覆盖面
实现的是 CommonMark 的一个子集，官方用例通过 489/652。仓库中有一道一致率棘轮监测这个数字，只允许上升不允许下降。
:::

## 代码着色

```ts
import { createHighlighter } from "@xihan-ui/code-highlight";

const highlighter = createHighlighter();
const tokens = highlighter.highlight(code, "typescript"); // CodeToken[] | null
```

自研的粗粒度词法器，只区分注释、字符串、数字、关键字、标点五类。类型名、函数名、属性名这类需要语法树才能区分的内容一概不分：那属于 TextMate 语法一档的工作，本实现不追求。

无法识别的语言、超长代码一律返回 `null`，调用方原样渲染纯文本。

`HighlighterPort` 同样是 `@xihan-ui/core` 中的端口。需要更高精度时，把其他高亮库接到同一个端口即可，`code-view` 组件侧不需修改。

## 相关

- [消息流](../components/message-feed) 与 [提示输入框](../components/prompt-input)：合起来即一个最小对话界面
- [日志](../components/log)：不分条、只向下追加的输出，同样贴底
- [代码视图](../components/code-view)：把流中的代码原文渲染为带行号的代码块

- [行为原语](./behavior#贴底)：消息列表的自动贴底
