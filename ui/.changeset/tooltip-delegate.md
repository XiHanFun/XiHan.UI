---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 提示的委托模式 `delegate`：值是 CSS 选择器，一个提示管一整个容器。trigger 此时是容器，容器里命中选择器的元素悬停或键盘聚焦时打开提示并作锚点，挪到另一个锚点时直接换过去、不再等延时；指针移出容器、焦点离开容器或按 Esc 时收起。文字取锚点的 `data-xh-tooltip`，没写时取锚点的可及名；快捷键取锚点的 `aria-keyshortcuts`，按 `platform` 写成当前平台的样子。content 里多两个部件 `text` 与 `shortcut`，Vue / React 新增 `XhTooltipText`、`XhTooltipShortcut`。提示文字与锚点的名字不同时，锚点的 `aria-describedby` 才引用 `text`。

**新增** 提示的 `translations`，目前一项 `keyLabel`：委托模式下快捷键里一枚键显示的字，十种内建语言包与 Kbd 用同一张键帽表。
