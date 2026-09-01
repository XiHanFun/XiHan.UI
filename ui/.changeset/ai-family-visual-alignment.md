---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

AI 组件族八件统一补齐动效、表面语言与几处真实能力缺口。全部纯增量，没有删名或改名。

**动效**

- 卡片进场：`approval` / `tool-call` / `message-feed` 的条目与回到底部按钮都有了淡入上移的进场。
- 折叠开合：`tool-call` 与 `reasoning` 的详情区改为行高与内缩同帧动的展开收起，收起在动画播完之后才真正落成，退场窗口内由 `inert` 挡住读屏与 Tab 序；折叠指示器的转向与它同一档时长同一条曲线。
- 位移与高度类动画统一走新的 `--xh-motion-ease-enter-strong`，微交互仍走 `--xh-motion-ease-enter`。
- 「正在跑 / 正在想」有了表达：`tool-call` 的状态文字与 `reasoning` 的标题会扫一道光，减少动效偏好下自动换回平色。
- `markdown-stream` 的光标改成等第一个字时闪、开始出字后淡入一次并停在实心；块列表还空着时光标落在根上，「请求已经发出去」第一帧就看得见。

**表面**

`approval` / `code-view` / `diff-view` / `tool-call` / `reasoning` / `prompt-input` 的卡面与输入壳统一接了一档静态海拔，各自留有 `--xh-<组件>-shadow` 覆盖槽；`code-view` 补上了此前完全没有的描边与卡片底色。

**新增的部件与属性**

- `tool-call`：`summary`（收起态也看得见这次查了什么、改了哪个文件）与 `duration` 两个部件，配 `startTime` / `endTime` 两个属性、`durationMs` 与纯函数 `toolCallDuration()`、文案键 `ranFor`。
- `reasoning`：`icon` 部件、`variant` 属性（`outline` / `subtle` / `ghost`，`ghost` 是无壳内联形态）、`statusText`（此前声明了却从没被消费的三个文案键现在真的生效）与纯函数 `reasoningStatusText()`。
  自定义元素侧另有只读属性 `element.durationMs`，与 Vue 根插槽的同名字段对齐。
- `approval`：`note`（附在判定上的自由文本）、`result`（判定落定后看得见的那一格）、`actions` 三个部件，配 `note` / `defaultNote` / `onNoteChange` 与 `ApprovalNoteChangeDetails`。
- `diff-view`：`stat`（头部的增删统计位）与 `segment`（字级差异高亮）两个部件，配 `wrap` 属性与 `DiffViewSegment` / `DiffViewSegmentProps`。
- `prompt-input`：可选的 `input-row` 部件——写了它，外壳翻成竖排、输入框与按钮收进这一行，上下两侧腾出来放附件条与工具行。
- `markdown-stream`：`caret` 开关与 `data-caret` 落点。

**修复**

- `code-view` 的行号被语法数字色染成琥珀色（`--xh-code-view-number-fg` 一个名字被两处消费）。
- `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。
- 八处按下缩放没有过渡，按下与松手都是硬切。
- `code-view` 的 `<pre>` 挂着 `aria-labelledby` 却没有能承载可访问名的角色，属性无效；现在发 `role="group"`。
- `message-feed` 的集合语义从最外层挪到直接包着条目的内容层：`role="feed"` 只认 `role="article"` 的子节点，而播报区与回到底部按钮都是最外层的孩子。最外层继续当唯一的 Tab 停靠点与键盘宿主。播报区不再发 `role="status"`，改用等价的 `aria-live` + `aria-atomic` 两条。
- `approval` 的备注框在根内，组合输入法期间按 Escape 是收候选词框而不是拒绝，现在挡住了组合态。
