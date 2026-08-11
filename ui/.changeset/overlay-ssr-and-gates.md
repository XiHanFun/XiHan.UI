---
"@xihan-ui/kernel": major
"@xihan-ui/machine": major
"@xihan-ui/behavior": patch
"@xihan-ui/tokens": patch
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
---

修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

**嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
`body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
把它并进背景失活的目标集。

**破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
`() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
自行实现该接口的需要补上。

**破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
`Dict<string>` 编不编得过。

**首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
客户端水合时再整棵补出来。初值改取状态机的展开态。

**没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
`createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。
