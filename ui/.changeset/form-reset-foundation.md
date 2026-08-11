---
"@xihan-ui/machine": major
"@xihan-ui/behavior": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
---

复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
没有任何一处监听所属表单的 reset。

**机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
组件文件零改动。

一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

**落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

**受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
**受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

**监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
锚点是组件根节点而不是影子输入。

BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。
