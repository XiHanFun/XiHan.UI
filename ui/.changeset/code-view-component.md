---
"@xihan-ui/tokens": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `code-view` 组件：一段代码的逐行呈现，Vue 与 Web Components 两侧同时可用。

它比 `code-block` 多出行号、指定行高亮、超长折叠与文件名四件，而这四件都建立在同一件事上——**逐行切分在连接层完成**。词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释就是这样），所以「一个记号一个 span」的渲染方式切不出行；行号与高亮行不是皮肤能反推出来的东西。切分保证无损：`lines.map(l => l.text).join('\n')` 逐字等于原文，着色实现即使给不全记号也用纯文本片段补齐。

`lineNumbers` 的行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。`startLine` 让摘录与 patch 片段的行号对得上真实文件，`highlightLines` 收 `'3,7-9'` 或行号数组，写错的片段丢掉而不是让整段代码渲不出来。

`clamp` 给出折叠阈值，`clamped` 是**纯受控**的：折叠态通常由页面上「全部展开 / 全部折叠」统一持有，组件内建一份只会跟它打架；要非受控就套 `collapsible`。折叠按钮带 `aria-expanded` 与指向代码区的 `aria-controls`。

`complete` 与 `highlighter` 沿用 `code-block` 的取舍：未闭合默认不着色，着色端口返回 `null` 是合法结果、退回纯文本。渲了文件名节点它就成为代码区的可访问名，没渲则用 `translations.code` 兜底。复制不内建，与 `clipboard` 组合。

**新增** 语义令牌 `--xh-text-code-leading`：代码行距从此有名字，`code-block` 与 `code-view` 都指向它，不再各写一份字面量。
