---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**修复**三处按钮的可访问名。

`question-flow` 的提交键**不再无条件发英文 `aria-label`**。这颗按钮按惯例带可见文字（库里的示例写的是「继续」/「发送」），写死的 `Continue` / `Send answers` 会把那行字盖掉：语音控制照着屏幕上看得见的词说「点击 继续」就再也点不动它。现在与同一份 footer 里的跳过键同一口径——`translations.continue` / `translations.send` 给了才发，不给就让可见文字自己当名字。**注意**：原先靠这两句英文兜底的用法，现在需要显式给 `translations`。

**新增** `TransferTranslations.toTarget` / `toSource`，两颗搬运钮从此各带一个 `aria-label`（兜底 `Move to target list` / `Move to source list`）。它们默认是空按钮——箭头由皮肤画在伪元素上，伪元素进不了可及树——而这两颗钮是 transfer 唯一的操作出口，名字缺席等于整个组件对读屏不可用。`transfer` 同时补上 `translations` 这个 prop，Vue 与 Web Components 两侧都接得到全局配置。

**新增** `TableTranslations.selectAll`，全选把手从此带 `aria-label`（兜底 `Select all rows`）。这一格默认没有内容，行内那颗把手又是 `aria-hidden` 的，它是整张表的选择功能对读屏唯一的入口。
