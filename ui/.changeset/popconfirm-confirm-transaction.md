---
'@xihan-ui/headless': minor
'@xihan-ui/react': minor
'@xihan-ui/vue': minor
'@xihan-ui/web-components': minor
---

Popconfirm 的确认动作改为一项明确的事务。`onConfirm` 现在接收任意 `PromiseLike` 返回值，调用前即同步占用；
跨 realm Promise、自定义 thenable、同步抛错、读取 `then` 时抛错和异步拒绝都走同一条生命周期，不再依赖
`instanceof Promise`。pending 会阻止重复确认、trigger 切换、`setOpen(false)`、Escape 与层外交互；兑现后才收起。

新增 `actionError` 状态与 `confirm-error` 通知，`details.cause` 保留原始抛出或拒绝值，包括 `undefined`。
新一轮确认会清除旧错误。取消会立即解除 pending、关闭浮层并使当前事务票据失效；它不会声称取消业务 Promise，
迟到的兑现或拒绝不会关闭新会话，也不会写回错误。组件卸载后的旧结算同样失效。
受控 `open` 的真实关闭再重开也会换一张事务票据并解除 pending；已取消或停机的回调即使返回已拒绝 Promise，
组件仍会接管其拒绝，避免产生未处理拒绝，但不会恢复已失效事务。

非模态 Popconfirm 的内容角色由 `alertdialog` 校正为 `dialog`，与不陷焦点、不锁滚动、不隐藏页面其它内容的既有合同一致；
这次调整没有引入完整模态行为。pending 确认按钮新增 `aria-disabled="true"`，仍保留焦点并通过 `aria-busy` 报告在途。
