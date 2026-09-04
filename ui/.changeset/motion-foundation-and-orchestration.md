---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

**动效补上编排、方向感与退场三层：交错从零到 36 处，浮层有了锚点原点，退场不再是进场倒放。**

**此前全库没有编排。** `animation-delay` 0 处、`transition-delay` 0 处、`will-change` 0 处、`transform-origin` 1 处——不是动画做得少，是每个动画各自孤立地淡入淡出，没有先后、没有方向、没有分档。175 条 `transition` 里 68% 用同一支时长、71% 用同一支曲线。

现在：零动效皮肤 43 → 32、`transition` 175 → 200、`animation-delay` 0 → **36**（交错一律走 `calc(N * var(--xh-motion-stagger-step))`，封顶 6 项）、`will-change` 0 → **29**（全部挂在 `[data-state='open']` 一类的状态规则上，随状态一起撤走，不常驻占合成层）、`transform-origin` 1 → **14**（13 个锚定浮层按 `[data-placement]` 打原点并加 4px 方向位移，进场看得出是从哪儿冒出来的）。曲线分布：`enter` 272→238、`enter-strong` 51→150、`continuous` 4→24、`slide`/`sweep`/`settle` 各 0→1。

**新增令牌 10 支，全部是加法。** 原语 3 支：`--xh-ease-out-fluid`（与 HeroUI 的 `--ease-out-fluid` 逐值相同）、`--xh-ease-in-out`（与本仓 `easing.ts` 的 `easeInOut` 逐值相同，新增它零 JS 改动）、`--xh-ease-out-back`（过冲后落位，全库此前不存在任何会过冲的动效）。语义 7 支：`--xh-motion-ease-slide` / `-sweep` / `-settle`、`--xh-motion-duration-slide`(320ms) / `-nudge`(200ms)、`--xh-motion-stagger-step`（派生自 `duration-enter` 的五分之一 = 40ms）、`--xh-motion-scale-exit`(0.98)。

`sweep` 与 `loop` 分家的理由和当年 `loop` 与 `continuous` 分家同源：单向循环匀速是硬要求（转圈忽快忽慢不可接受），而往返循环在折返点需要两端减速——`linear` 在那里是瞬时反向，读成硬弹。

`scale-exit` 0.98 比进场起点的 0.96 更靠近 1：退场不是进场倒放，收得更浅才不显得被吸走。

减弱档：`duration-slide` / `-nudge` 归 1ms，`scale-exit` 归 1，`stagger-step` **显式归 0ms**——不靠 `calc` 传递。减弱档 `duration-enter` 是 1ms，除 5 得 0.2ms，六项交错累计出一毫秒的、看不见但确实在动的错位。三支新曲线不重映射，1ms 内曲线不可见。

**焦点环一个字未动。** 曾有提议给 91 份皮肤加 `transition: outline-color`，但 `outline-color` 的初始值是 `currentColor` 不是 `transparent`，从它过渡到聚焦色得到的是一段颜色抹擦而不是淡入。真正的差距在 `box-shadow`：68 份皮肤用它表达悬停抬升、`focus-within` 海拔变化、选中态内阴影，此前只有 `card` 与 `slider` 两处把它写进过渡，其余全是硬切，本批按状态变化逐处补齐。

**修掉 15 处 `will-change` 声明错属性。** `transform` 与 `scale` / `translate` / `rotate` 在现代 CSS 里是各自独立的属性——关键帧动的是 `scale` 与 `translate`，而声明写的是 `transform` 时，点到的那个属性一帧都不会动、真会动的两个一个没点到。`dialog` / `drawer` 与 13 个锚定浮层全中。新增判据 `check-will-change.mjs` 守住，它只咬「点了却不会动」，不咬「会动但没点」——`will-change` 的用途是提示合成层提升，只点需要提升的那几个是对的。
