---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

Truncate 的展开改由独立的 `trigger` 部件承担，并新增中间省略。

破坏性：开了 `expandable` 后文字盒子（root）不再是按钮——不再带 `role="button"`、`tabindex`、`aria-expanded`，点文字与在文字上按 Enter / Space 都不再展开。展开交互移到文字盒子之后的一颗原生按钮上（Action Control 文字档，ghost、sm），`aria-controls` 指回文字盒子，真被裁了（或已铺开）才出现，否则 `hidden` 不占位；root 的 `data-state` 仍只在能展开时写。Vue / React 开了 `expandable` 时自动铺出这颗按钮，与文字盒子并排交给外层排版，透传属性落在文字盒子上（Vue 设 `inheritAttrs: false`）；按钮内容可由 Vue 的 `trigger` 插槽、React 的 `trigger` prop 换掉，载荷为 `{ open, triggerLabel }`。Web Components 需要作者写一个 `<button data-xh-part="trigger">` 与 root 并排：留空时元素按展开态写入缺省文案，写了内容原样保留。按钮文案走新增的 `translations`（`expand` / `collapse`，缺省 `Show more` / `Show less`），也接全局配置的 `truncate` 分桶。Headless 新增 `getTriggerProps`、`triggerLabel`，`TruncateTranslations` 新增两键，root 新增 `id`。

新增：`position`（`end` | `middle`，默认 `end`）。`middle` 只对单行生效：真被裁且收着时 root 投影 `data-position="middle"` 与 `data-middle-text`（压好空白的整段文字），皮肤用两个伪元素各画一半——前一半末尾收省略号、后一半反向排露出结尾，原文照旧排着但不上色，溢出照它量、读屏照它念；强制色下退回末尾省略。新增导出类型 `TruncatePosition`（Vue / React 另导出 `TruncateTriggerSlotProps`）。truncate.css 的体积基线随中间省略与按钮规则上调。
