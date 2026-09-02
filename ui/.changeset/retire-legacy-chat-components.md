---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**`thread`、`composer`、`code-block` 三个组件已整体删除。** 不留别名、不留转发、不留提示：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。三者各有覆盖它的后继，逐个说清怎么换。

## 一、`code-block` → `code-view`

能力上是严格超集：`code` / `lang` / `complete` / `highlighter` / `highlightWhileStreaming` / `wrap` 六个入口的语义一字未变，`root` / `pre` / `code` / `lang-label` / `token` 五个部件仍在，另外多出行号、指定行高亮、超长折叠与文件名。

**结构上不是改名。** `code-block` 在 Vue 侧是一个包办到底的 `<XhCodeBlock>`，`code-view` 是拆开的部件族，最小写法要三个：

```vue
<XhCodeViewRoot :code="src" lang="ts" complete>
  <XhCodeViewPre><XhCodeViewCode /></XhCodeViewPre>
</XhCodeViewRoot>
```

| 已删 | 换成 |
| --- | --- |
| Vue `<XhCodeBlock>` | `<XhCodeViewRoot>` + `<XhCodeViewPre>` + `<XhCodeViewCode>`（文件名与语言标注另有 `<XhCodeViewHeader>` / `<XhCodeViewFilename>` / `<XhCodeViewLangLabel>`） |
| 自定义元素 `<xh-code-block>` | `<xh-code-view>` |
| `connectCodeBlock` / `codeBlockAnatomy` / `codeBlockKeyboard` / `codeBlockMeta` | `connectCodeView` / `codeViewAnatomy` / `codeViewKeyboard` / `codeViewMeta` |
| 类型 `CodeBlockApi` / `CodeBlockProps` / `CodeBlockTranslations` | `CodeViewApi` / `CodeViewProps` / `CodeViewTranslations` |
| `CODE_BLOCK_FALLBACK_LANG` | `CODE_VIEW_FALLBACK_LANG` |
| `countCodeLines` | `countCodeViewLines` |
| 类型 `XhCodeBlockElement` | `XhCodeViewElement` |
| 部件 `data-part="root"` / `"lang-label"` / `"pre"` / `"code"` / `"token"` | 五个都在，名字不变 |
| 记号在 DOM 里的位置：`data-part="token"` 直接挂在 `data-part="code"` 下 | 中间多了两层——`code` 下是逐行的 `data-part="line"`，行里是 `data-part="line-content"`，记号挂在它下面。写死层级的后代选择器（`[data-part='code'] > [data-part='token']`）要改 |
| root 上的 `data-lang` / `data-complete` / `data-wrap`、token 上的 `data-kind` | 同名同值 |
| 子入口 `@xihan-ui/styles/code-block.css` | `@xihan-ui/styles/code-view.css` |
| 覆盖槽 `--xh-code-block-*`（10 个） | 同名的 `--xh-code-view-*` |
| 文案覆盖表的 `'code-block'` 键 | `'code-view'` |

## 二、`composer` → `prompt-input`

部件同构（`root` / `input` / `submit-trigger`），`prompt-input` 另有可选的 `input-row` 与形态、语气、尺寸三轴。两处入口语义要改写：

**运行态从两档字符串变成一个布尔。** `composer` 收 `runStatus: 'ready' | 'streaming'`，`prompt-input` 收 `busy: boolean`：`'streaming'` 对应 `busy` 为真，`'ready'` 对应不写 `busy`。组件真正需要的只有这个二值判断——按钮换不换成停止身份、提交路径挡不挡。类型 `ComposerRunStatus` 没有后继。

连带一处选择器要改：`composer` 把运行态铺成 root 上的 `data-state`（取值就是 `ready` / `streaming`），`prompt-input` 的 root 上**没有 `data-state`**，生成中改由布尔属性 `data-loading` 表达。`[data-scope='composer'][data-part='root'][data-state='streaming']` 换成 `[data-scope='prompt-input'][data-part='root'][data-loading]`。输入框那一层的 `data-state`（`empty` / `editing` / `disabled`）两边同名同值，不动。

**回车从布尔变成按键档。** `submitOnEnter` 只能表达「回车提交还是换行」，`submitKey` 表达「哪一组按键才算提交」，本次给它补上 `'none'` 一档后两者可以精确对应。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhComposerRoot>` / `<XhComposerInput>` / `<XhComposerSubmitTrigger>` | `<XhPromptInputRoot>` / `<XhPromptInputInput>` / `<XhPromptInputSubmitTrigger>` |
| 自定义元素 `<xh-composer>` | `<xh-prompt-input>` |
| `useComposer()` | `usePromptInput()` / `usePromptInputContext()` |
| `connectComposer` / `composerAnatomy` / `composerKeyboard` / `composerMachine` / `composerMeta` | `connectPromptInput` / `promptInputAnatomy` / `promptInputKeyboard` / `promptInputMachine` / `promptInputMeta` |
| 类型 `ComposerApi` / `ComposerSchema` / `ComposerState` / `ComposerTranslations` / `ComposerSubmitDetails` / `ComposerValueChangeDetails` | 同名的 `PromptInput*` |
| 类型 `ComposerContext` / `ComposerCallbacks` / `ComposerRootSlotProps` / `XhComposerElement` | `PromptInputContext` / `PromptInputCallbacks` / `PromptInputRootSlotProps` / `XhPromptInputElement` |
| 类型 `ComposerRunStatus` | 无——改用布尔 `busy` |
| prop `runStatus="streaming"` | `busy`（真） |
| prop `runStatus="ready"` | 不写 `busy`（假） |
| prop `submitOnEnter`（默认真） | `submitKey="enter"`（默认，不写即是） |
| prop `:submit-on-enter="false"` | `submitKey="none"` |
| 部件 `data-part="root"` / `"input"` / `"submit-trigger"` | 同名，另有可选的 `data-part="input-row"` |
| root 上的 `data-state="ready"` / `"streaming"` | root 上的 `data-loading`（布尔属性，只在生成中出现） |
| input 上的 `data-state`、submit-trigger 上的 `data-mode="send"` / `"stop"`、root 上的 `data-disabled` | 同名同值 |
| `translations.input`（必填） | 同名但可选；**不给就整条 `aria-label` 不输出**，免得盖掉作者的 `<label for>` |
| 子入口 `@xihan-ui/styles/composer.css` | `@xihan-ui/styles/prompt-input.css` |
| 覆盖槽 `--xh-composer-*`（27 个） | `--xh-prompt-input-*`；发送与停止两态的 `--xh-composer-send-*` / `--xh-composer-stop-*` 改由提交钮的 `data-mode` 分档 |
| 文案覆盖表的 `'composer'` 键 | `'prompt-input'` |

`prompt-input` 另有 `composer` 没有的入口：`allowEmptySubmit`（有附件时允许空值提交）、`clearOnSubmit`（提交后清不清空）与 `variant` / `tone` / `size` 三轴，都是新增，不影响照上表改完的代码。

## 三、`thread` → `message-feed` 或 `log`

`thread` 一件同时管两种场景，后继按场景分成两件：**结构化会话**用 `message-feed`（条目集合语义、条目键盘遍历、统一播报区），**任意内容粘底**用 `log`。`log` 本次补上了 `scroll-button` 与 `live-region`，两条路都不缺件。

粘底那套入口（`threshold` / `onStickChange` / `translations`）两边同名同义。`thread` 的 `status`（`idle` / `submitted` / `streaming` / `error`）只有 `message-feed` 有；`log` 那侧对应的是布尔 `loading`。

| 已删 | 换成（结构化会话） | 换成（任意内容粘底） |
| --- | --- | --- |
| Vue `<XhThreadRoot>` / `<XhThreadViewport>` / `<XhThreadContent>` / `<XhThreadScrollButton>` / `<XhThreadLiveRegion>` | `<XhMessageFeedRoot>` / `<XhMessageFeedViewport>` / `<XhMessageFeedList>` / `<XhMessageFeedScrollButton>` / `<XhMessageFeedLiveRegion>`（条目另有 `<XhMessageFeedItem>` / `<XhMessageFeedItemLabel>`） | `<XhLogRoot>` / `<XhLogViewport>` / `<XhLogContent>` / `<XhLogScrollButton>` / `<XhLogLiveRegion>`（行另有 `<XhLogLine>`） |
| 自定义元素 `<xh-thread>` | `<xh-message-feed>` | `<xh-log>` |
| `useThread()` / `useThreadContext()` / `provideThread()` | `useMessageFeed()` / `useMessageFeedContext()` / `provideMessageFeed()` | `useLog()` / `useLogContext()` |
| `connectThread` / `threadAnatomy` / `threadKeyboard` / `threadMachine` / `threadMeta` | 同名的 `messageFeed*` | 同名的 `log*` |
| 类型 `ThreadApi` / `ThreadSchema` / `ThreadRefs` / `ThreadStatus` / `ThreadStickChangeDetails` / `ThreadTranslations` / `ThreadContext` / `ThreadRootSlotProps` | 同名的 `MessageFeed*` | `LogApi` / `LogSchema` / `LogTranslations` / `LogContext` / `LogRootSlotProps` |
| 类型 `XhThreadElement` | `XhMessageFeedElement` | 无导出的元素类，标签 `<xh-log>` 照常注册 |
| prop `status` | `status`（同名同值） | `loading`（布尔） |
| 部件 `data-part="content"` | `data-part="list"`，且条目必须是它的**直接子节点**（`data-part="item"`，带 `item-id` / `item-index` / 可选 `item-role`） | `data-part="content"`（同名），行是 `data-part="line"` |
| 部件 `data-part="root"` / `"viewport"` / `"scroll-button"` / `"live-region"` | 同名 | 同名 |
| viewport 上的 `role="log"` + `tabindex="0"` + `aria-live="off"` + `data-state` | 都不在 viewport 上了：Tab 停靠位与键盘宿主挪到 root，集合语义改由 list 上的 `role="feed"` 承担，viewport 只剩几何 | 仍在 viewport 上（`role="log"`、`tabindex="0"`、`aria-live="off"`），但 viewport 上没有 `data-state` |
| root 上的 `data-state="<status>"` | 同名同值 | 没有；改看 root 上的 `data-loading` / `data-at-bottom` / `data-sticking` |
| scroll-button 上的 `data-state="visible"` / `"hidden"` | 同名同值 | 同名同值 |
| 子入口 `@xihan-ui/styles/thread.css` | `@xihan-ui/styles/message-feed.css` | `@xihan-ui/styles/log.css` |
| 覆盖槽 `--xh-thread-*`（16 个） | `--xh-message-feed-*` | `--xh-log-*` |
| 文案覆盖表的 `'thread'` 键 | `'message-feed'` | `'log'` |

`@xihan-ui/chat-stream` 的 `createThreadStore` / `ThreadStore` / `ThreadStatus` / `ThreadSnapshot` / `ThreadStoreOptions` 是那个包自己的数据仓，与本组件同名但无关，一个字没动。

## CSS 选择器要自己搜一遍

`[data-scope='thread']`、`[data-scope='composer']`、`[data-scope='code-block']` 三个作用域不再有任何节点带上。选择器失配既不报错也不降级，请在自己的代码库里全文搜索这三个串，连同上面三张表里的 `--xh-` 覆盖槽名一起换掉。

## 文档站的示例去了哪

三个组件的示例目录整个删掉。迁过去的那些改成了后继组件的写法，Vue 与自定义元素两版都在；没迁的逐条写明理由。

| 已删的示例 | 去向 |
| --- | --- |
| `thread/01-basic` | `message-feed/01-basic` 已覆盖三层骨架 |
| `thread/02-stick` | `message-feed/02-sticky` 已覆盖粘底与回到底部 |
| `thread/03-status` | 迁成 `message-feed/04-status` |
| `thread/04-load-more` | 迁成 `message-feed/05-load-more` |
| `thread/05-scroll-control` | `log/03-follow` 已覆盖「不用内置那颗按钮，自己拿 `atBottom` 与 `scrollToBottom` 画一条回到最新」 |
| `thread/06-chat` | `prompt-input/02-chat` 已覆盖消息流配输入框的整页 |
| `thread/07-load-earlier` | 迁成 `message-feed/06-load-earlier` |
| `thread/08-scroll-to` | 迁成 `message-feed/07-scroll-to`。跳转不再靠自己算 `offsetTop`：`scrollToItem(id)` 与 `focusItem(id)` 收的就是写在条目上的那个 `item-id`。自定义元素那侧只暴露 `scrollToBottom()`，别的位置仍按 `item-id` 取节点自己滚 |
| `composer/01-basic` | `prompt-input/01-basic` |
| `composer/02-streaming` | `prompt-input/02-chat` 与 `prompt-input/03-layout` 已覆盖 `busy` 与原位停止 |
| `composer/03-enter` | 迁成 `prompt-input/04-submit-key`，三档按键各摆一台 |
| `composer/04-disabled` | 迁成 `prompt-input/05-disabled`，另加 `allowEmptySubmit` 一档 |
| `composer/05-clear` 与 `composer/06-count` | 并成 `prompt-input/06-extras`：附加按钮、`setValue` 清空、`maxlength` 与字数在同一台上 |
| `composer/07-autosize` | 迁成 `prompt-input/07-autosize` |
| `composer/08-filter` | 不另开一份：改写值走的是同一条路（root 插槽的 `setValue`），`prompt-input/06-extras` 里就是这么写的 |
| `composer/09-focus` | 迁成 `prompt-input/08-focus` |
| `composer/10-status` | 迁成 `prompt-input/09-invalid`，覆盖的变量由 `--xh-composer-border` 换成 `--xh-prompt-input-border` |
| `code-block/01-basic` | `code-view/01-basic` |
| `code-block/02-streaming` | 「未闭合默认不着色」那半边由 `code-view/04-streaming` 覆盖；`highlightWhileStreaming` 那半边迁成 `code-view/07-streaming-highlight` |
| `code-block/03-highlighter` | 迁成 `code-view/06-highlighter` |
| `code-block/04-line-numbers` | 不迁：那份示例是在 `code-block` 旁边手搭一栏行号，再用 `--xh-code-block-line-height` / `--xh-code-block-p` / `--xh-code-block-label-py` / `--xh-code-block-label-font-size` 把两栏对齐。`code-view` 自带 `lineNumbers`（配 `startLine`、`highlightLines`），行号由皮肤用 `attr()` 画，复制代码不会带上它，读屏也不念——见 `code-view/02-line-numbers`。那四个用于对齐的槽随皮肤一起没了 |

指向这三件的文档链接同步改了：AI 对话内核那页的组件清单换成消息流 / 日志 / 提示输入框 / 代码视图四件，流式 Markdown 与代码着色两页指向代码视图，首页的组件清单同改。`message-feed` 与 `log` 互相点明了分界：分得出「第几条、谁说的」用前者，一整段往下追加用后者。
