来源：https://ui.docs.xihanfun.com/runtime/markdown

# 流式 Markdown

`@xihan-ui/markdown` 解决一个具体问题：AI 逐 token 输出 Markdown，需要边接收边渲染，且不能每帧重建整段 DOM：重建一次，用户的选区和滚动位置即丢失。

对外只有一个工厂。

```ts
import { createStreamRenderer } from "@xihan-ui/markdown";

const renderer = createStreamRenderer();

// 每收到一批增量，把截至当前的全文整份传入
const blocks = renderer.render(fullTextSoFar);

// 流结束时告诉它
const final = renderer.render(fullText, { ended: true });

renderer.dispose();
```

## 产出的是块，不是一整串 HTML

```ts
interface RenderedBlock {
  readonly key: string; // 稳定 key
  readonly kind: "markdown" | "code" | "math" | "html";
  readonly html: string; // 已消毒，可直接插进 DOM
  readonly complete: boolean; // 该块是否已闭合
  readonly lang?: string; // 围栏语言标注，仅 code 块有
  readonly source?: string; // 块正文的原始文本，仅 code 与 math 两种块有
}
```

三点需要单独说明：

`key` 是稳定的。生长中的块恒为 `LIVE_BLOCK_KEY`，定型块由下标与内容摘要拼成。框架据此复用同一份 DOM 只改文本，而不是整段重建。`v-for` 中必须用它作为 key，使用下标会失去这一保证。

`render` 是幂等的。传同一份全文调用多少次结果都相同，内部按块 memo，已定型的块不会重渲染。因此不需要自行做增量 diff，每帧整份传入即可。

`complete` 用于决策。未闭合的块随时会变，昂贵的渲染（如[代码着色](./code-highlight)）等它闭合后再执行。[代码视图](../components/code-view)组件的 `complete` 与 `highlightWhileStreaming` 两个 prop 即为此保留。

## 未传 `ended` 的后果

不传等同于仍在生长：最后一块按未闭合处理，key 为 `LIVE_BLOCK_KEY`。流结束时必须传 `{ ended: true }`，否则最后一段永远停在生长态，key 也无法确定。

## 这是一个子集，不是 CommonMark 实现

当前对官方 652 条用例的一致率是 489/652（75.0%），逐节数字在包内的 `tests/commonmark-baseline.json`。

这个数字不是目标，是事实的记录。本包服务于 AI 聊天输出，不是通用 Markdown 渲染，因此不追求满分。

### 按设计不通过的

| 节 | 条数 | 原因 |
| --- | --- | --- |
| HTML blocks | 0/44 | 原生 HTML 块不透传 |
| Raw HTML | 7/20 | 行内原生 HTML 不透传 |

消毒位于解析器内部（`html: false` 加协议白名单），而不是渲染后再清洗一次。不透传 HTML 是这条安全约束的代价，也是本包最重要的一条约束，不会为了通过率修改。把这两节摘掉之后的一致率是 482/588（82.0%）。

内容来源可信且确实需要透传 HTML 时，本包不适用：换用通用 Markdown 渲染器并自行接入消毒。

### 已知缺口

| 缺口 | 波及 | 说明 |
| --- | --- | --- |
| 列表项内容缩进的判定 | `List items` 35/48、`Lists` 19/26 | 延续行要缩进到标记后内容起始列才属于该项；当前按剥除最多 N 个空格近似，相差一列无法区分。目前最大的缺口 |
| 标题中的换行 | `Link reference definitions` 19/27 | 跨行标题的换行被丢弃，规范要求原样保留在 `title` 属性中 |
| 制表符在列表与引用中的展开 | `Tabs` 6/11 | 行首缩进已按 4 列制表位计算，列表项内容缩进与引用标记后的制表符尚未使用同一套换算 |

## 不暴露解析中间态的原因

解析、切块、冻结缓存一概不对外。中间态暴露后，消费方迟早会绕过缓存直接修改块，增量渲染的保证随之失效。定制渲染在块这一层进行：`kind` 与 `complete` 足以决定每一块交给谁渲染。

## 与组件的配合

它产出数据，不产出 DOM，因此框架无关。一条助手消息的正文即它的块列表，典型接法是配合[消息流](../components/message-feed)：

```vue
<XhMessageFeedItem :item-id="message.id" :item-index="index" item-role="assistant">
  <div v-for="block in blocks" :key="block.key" v-html="block.html" />
</XhMessageFeedItem>
```

不分条、只向下追加的输出（命令回显、构建日志）配合[日志](../components/log)，贴底机制相同。

`v-html` 在这里是安全的：`html` 字段已经消毒，这正是消毒位于解析器内部的意义。

代码块的 `html` 是一份降级产物：渲染好的 `<pre><code>`，语言标注在 `lang` 上。原始代码文本另存于 `source`，因此换成组件形态只需一次转交：`source` 交给[代码视图](../components/code-view)的 `code`，`lang` 与 `complete` 原样传入，行号、指定行高亮、超长折叠与闭合后着色都由它负责。


```vue
<XhCodeViewRoot :code="block.source" :lang="block.lang" :complete="block.complete" line-numbers>
  <XhCodeViewPre><XhCodeViewCode /></XhCodeViewPre>
</XhCodeViewRoot>
```
