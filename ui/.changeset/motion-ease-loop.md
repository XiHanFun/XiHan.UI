---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": patch
---

**新增**循环缓动令牌 `--xh-motion-ease-loop`（恒是 `linear`）。无限循环的动画——加载环、流光、跑马灯——必须匀速：带缓动的曲线会让每一圈忽快忽慢。这一档背后刻意不设原语，匀速没有可调余地。

**收窄** `--xh-motion-ease-continuous` 的语义：它现在只管「元素在屏内被推到新位置」，不再兼管循环动画。原描述把两者合在一起，导致三处循环动画拿到了带缓动的曲线，而另外八处只能手写 `linear` 绕开——同一道流光在库里跑出两种节奏。

`button` / `marquee` / `notification` / `popconfirm` / `progress` / `reasoning` / `skeleton` / `spinner` / `switch` / `table` / `tool-call` 共 11 处循环改引 `--xh-motion-ease-loop`。取值与各自原先的实际表现一致或更正确，`segmented` 的滑块位置过渡保持在 `--xh-motion-ease-continuous`。
