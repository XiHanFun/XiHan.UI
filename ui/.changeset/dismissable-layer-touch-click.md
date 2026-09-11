---
'@xihan-ui/core': patch
---

DismissableLayer 现在把触摸的层外关闭推迟到同一次有效触摸生成的 `click`：`pointerdown`
只冻结路径与各 LayerRegistry lane 的关闭计划，匹配的 `pointerup` 只证明触摸完成，不会直接关闭；
随后同目标、同 pointer 身份的 `click` 到达时才重新核对 Layer、参与者与节点票据并提交。

滚动、`pointercancel`、长按 `contextmenu`、新 pointer、Window 失焦、Document 可见性变化或键盘进入新交互都会取消
待提交计划；Layer snapshot、参与者或节点换代同样使旧票失效。等待期间的触摸 `focusin` 不会抢先
触发 focus-outside。实现不使用固定超时，因滚动或长按没有生成 click 时不会误关。

mouse 与 pen 仍在原 `pointerdown` 当场仲裁。触摸提交时，`onPointerDownOutside` 与
`onInteractOutside` 的 `detail.originalEvent` 仍是最初建票的真实 `PointerEvent`；click 只作为
内部提交证据，公开事件名、回调名与类型保持不变。
