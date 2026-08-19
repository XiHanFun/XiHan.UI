# 流式 Markdown

`@xihan-ui/markdown` 解决的是一个很具体的问题：AI 一个 token 一个 token 地吐 Markdown，你要边收边渲染，而且**不能每帧重建整段 DOM**——重建一次，用户的选区和滚动位置就没了。

对外只有一个工厂。

```ts
import { createStreamRenderer } from '@xihan-ui/markdown'

const renderer = createStreamRenderer()

// 每收到一批增量，把「截至当前的全文」整份喂进去
const blocks = renderer.render(fullTextSoFar)

// 流结束时告诉它
const final = renderer.render(fullText, { ended: true })

renderer.dispose()
```

## 产出的是块，不是一整串 HTML

```ts
interface RenderedBlock {
  readonly key: string       // 稳定 key
  readonly kind: 'markdown' | 'code' | 'math' | 'html'
  readonly html: string      // 已消毒，可直接插进 DOM
  readonly complete: boolean // 该块是否已闭合
  readonly lang?: string     // 围栏语言标注，仅 code 块有
}
```

三件事值得单独说：

**`key` 是稳定的。** 生长中的那一块恒为 `LIVE_BLOCK_KEY`，定型块由下标与内容摘要拼成。框架据此复用同一份 DOM 只改文本，而不是整段重建。你在 `v-for` 里必须用它当 key——用下标就白费了。

**`render` 是幂等的。** 传同一份全文调多少次结果都一样，内部按块 memo，已定型的块不会重渲。所以你不需要自己做增量 diff，每帧整份喂进去就行。

**`complete` 是给你做决策用的。** 未闭合的块随时会变，昂贵的渲染（比如[代码着色](./code-highlight)）等它闭合再上。[代码块](../components/code-block)组件的 `complete` 与 `highlightWhileStreaming` 两个 prop 就是为这条留的。

## `ended` 不传是什么后果

不传等同于"还在生长"：最后一块会按未闭合处理，拿的是 `LIVE_BLOCK_KEY`。流结束时必须传 `{ ended: true }`，否则最后一段永远停在生长态，key 也定不下来。

## 这是一个子集，不是 CommonMark 实现

**当前对官方 652 条用例的一致率是 489/652（75.0%）**，逐节数字在包里的 `tests/commonmark-baseline.json`。

这个数字不是目标，是事实的记录。本包服务的是 AI 聊天输出，不是通用 Markdown 渲染，所以不追求满分。

### 按设计不打算过的

| 节 | 条数 | 原因 |
| --- | --- | --- |
| HTML blocks | 0/44 | 原生 HTML 块不透传 |
| Raw HTML | 7/20 | 行内原生 HTML 不透传 |

**消毒收在解析器内部**（`html: false` 加协议白名单），而不是渲染后再过一道清洗。不透传 HTML 是这条安全约束的代价，也是本包最重要的一条约束，不会为了跑分改掉。把这两节摘掉之后的一致率是 482/588（82.0%）。

如果你的内容来源可信、又确实需要透传 HTML，那本包不适合你——换一个通用 Markdown 渲染器，自己接消毒。

### 已知缺口

| 缺口 | 波及 | 说明 |
| --- | --- | --- |
| 列表项内容缩进的判定 | `List items` 35/48、`Lists` 19/26 | 延续行要缩进到「标记后内容起始列」才算这一项的；现在按剥掉最多 N 个空格近似，差一列的分不出来。眼下最大的一块 |
| 标题里的换行 | `Link reference definitions` 19/27 | 跨行标题的换行被吃掉了，规范要求原样留在 `title` 属性里 |
| 制表符在列表与引用里的展开 | `Tabs` 6/11 | 行首缩进已按 4 列制表位算，列表项内容缩进与引用标记后的制表符还没走同一套换算 |

## 为什么不暴露解析中间态

解析、切块、冻结缓存一概不对外。中间态放出去，消费方迟早绕过缓存直接改块，增量渲染的保证就没了。要定制渲染就在块这一层做——`kind` 与 `complete` 足够你决定每一块交给谁渲。

## 与组件的配合

它产出数据，不产出 DOM，所以框架无关。典型接法是配 [AI 会话线程](../components/thread)：

```vue
<XhThreadContent>
  <div v-for="block in blocks" :key="block.key" v-html="block.html" />
</XhThreadContent>
```

`v-html` 在这里是安全的——`html` 字段已经消毒过，这正是消毒收在解析器内部的意义。

代码块的 `html` 已经是渲染好的 `<pre><code>`，语言标注在 `lang` 上。**它不把原始代码文本交还给你**，所以没法直接转手喂给[代码块](../components/code-block)组件（那个组件收的是 `code` 原文）。要用组件形态的代码块，就得自己从流里另存一份原文，或者在渲染出的节点上后置着色——后者配 `complete` 判断更省：未闭合时不着色，闭合了再上一次。
