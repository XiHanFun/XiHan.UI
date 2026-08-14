---
"@xihan-ui/web-components": minor
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

补上动效地基的四个缺口。

**减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

**dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

**Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

**破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。
