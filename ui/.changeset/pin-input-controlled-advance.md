---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

**分格输入受控接法下敲一下就跳一格，不再要按两下。** `value` + `onValueChange` 回写的接法里（文档站「一次性验证码」示例，Vue 的 `v-model:value` 同样），敲第一个数字后焦点停在原格不走，再敲一下才跳格，且第二下会把第一格盖掉——用户看到的是首格填了第二个数字、光标才到第二格。

根因在连接层写完值之后回读 context 裁落点：受控时 context 里的值直读宿主的 prop，宿主把值写回要等它自己重渲（Vue 的 nextTick、React 的提交），事件处理器里回读到的仍是写之前那份，第一个空格还是刚填过的这一格，落点于是停在原地。Web Components 的 property 写回是同步的，不受影响。

现在落点在机器里随值一起裁定：`VALUE.FILL` 与 `VALUE.CLEAR_AT` 只按刚写下的值把 `focusedIndex` 挪到该去的格子（铺完落到下一格、`blurOnComplete` 且填满时撤到 -1、清格停在被清的那一格），连接层只照锚点搬焦点，不再按值裁一次；`INPUT.FOCUS` 发现锚点已在这一格上就不再裁，避免焦点事件到达时按旧值把焦点拽回去。方向键的落点同样先交机器裁定。

`PinInputApi` 没有增删条目。三端各补一条真实键盘的 Chromium 用例：受控与非受控、numeric / alphanumeric、otp 与非 otp、数字小键盘、粘贴整串与退格逐键断言焦点、各格的值与回调发数。
