---
"@xihan-ui/tokens": minor
"@xihan-ui/motion": minor
"@xihan-ui/styles": patch
---

**新增**入场缓动令牌 `--xh-motion-ease-enter-strong`（原语 `--xh-ease-out-strong` = `cubic-bezier(0.23, 1, 0.32, 1)`）。位移与高度变化走这一条：起步快、收尾长，比 `--xh-motion-ease-enter` 看得清。JS 侧同值常量 `easing.outStrong` 一并加上，两边由门禁对账。

**新增**正文行高令牌 `--xh-text-prose-leading`（原语 `--xh-leading-relaxed` = 1.625）。成段正文此前与控件文字共用 1.5 一个值。

**新增**兜底字形令牌 `--xh-glyph-mark-arrow-up`。此前只能借语义不对的 `--xh-glyph-mark-sort-asc`。

**修复** `code-view` 的行号被染成语法数字色。`--xh-code-view-number-fg` 一个名字被行号与数字记号两处消费，根上给它赋了语法色之后行号跟着变色。语法记号改用 `--xh-code-view-number-token-fg`，行号那个名字的语义不变。

**修复** `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。禁用时底色仍是品牌色而只把字变灰，现在底色一并降到 `--xh-bg-muted`。

**修复** AI 族八处按下缩放是硬切。`approval` / `code-view` / `diff-view` / `message-feed` / `prompt-input` / `reasoning` / `tool-call` 的可点部件此前只声明了 `:active` 的缩放量、没有把 `scale` 写进 `transition`，按下与松手都不过渡；同批补齐悬停与描边的过渡。
