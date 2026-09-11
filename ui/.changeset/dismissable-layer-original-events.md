---
'@xihan-ui/core': major
---

DismissableLayer 的 `onPointerDownOutside`、`onFocusOutside` 与 `onInteractOutside` 票据现在在
`detail.originalEvent` 中保留触发本轮仲裁的原生事件对象。pointer 票严格给出 `PointerEvent`，
focus 票严格给出 `FocusEvent`，interact 票给出两者的联合类型；事件不克隆，并由所属 Window
构造外层 `CustomEvent`。DOM 票与 options 回调继续收到同一个可取消事件，任一路
`preventDefault()` 都会在 specific、interact 两票送达后阻止本次关闭。

三个公开回调原先使用未约束的 `CustomEvent<any>`，现在收紧为上述精确泛型。显式把回调参数
标成其他 detail 形状的 TypeScript 调用方需要改为读取 `detail.originalEvent`。
