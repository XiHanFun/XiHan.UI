---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

SignaturePad 新增签名数据 `value` / `defaultValue` / `onValueChange` 与撤销、重做。

- 签名数据是逐笔的点加上笔迹坐标系（`SignaturePadValue = { strokes, surface }`），无损：存下 `value-change` 给出的数据，编辑页交回 `defaultValue` 即原样回显，之后照常续写。提供 `value` 即受控，抬笔、清空、撤销、重做只经 `onValueChange` 送出，落笔途中不发。导出的 SVG 读不回逐笔的点，回显要存数据。Vue 走 `v-model:value`；Web Components 的 `value` / `defaultValue` 只走 property，事件名 `value-change`。
- 新增部件 `undo-trigger` / `redo-trigger`（`XhSignaturePadUndoTrigger` / `XhSignaturePadRedoTrigger`），与清空按钮同为 Action Control text 档 sm、缺省 outline。一笔、一次清空各是一步，误清之后撤销能找回整份签名；再落一笔或清空后重做栈作废，宿主从外面换了一份签名时撤销与重做栈一并作废。没有可做的一步时按钮投影 `aria-disabled` 与置灰面，焦点仍留在钮上。
- API 新增 `value`、`canUndo`、`canRedo`、`undo()`、`redo()`；Web Components 元素新增 `undo()` / `redo()` 方法与只读的 `canUndo` / `canRedo`；文案新增 `translations.undoTrigger` / `translations.redoTrigger`；headless 导出 `EMPTY_SIGNATURE`。
- 表单重置回到 `defaultValue`（未提供时清空）并清掉撤销历史；`draw-end` 在撤销与重做时同样发出。
- 机器 context 由 `strokes` / `surface` 改为 `value` / `draft` / `past` / `future`，按压通道的 `pressed` 改为记录正被按住的是哪一颗按钮。
