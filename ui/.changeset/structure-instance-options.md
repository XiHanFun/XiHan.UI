---
'@xihan-ui/headless': minor
---

组合节点 `structureInstance` 的属性改为按组件名取那个组件的 headless props 加上它的结构选项：标题 `label`、清空钮 `clearable`、空态文字 `empty`、就地编辑 `editable` 等可以直接写进组合节点。组件自己推导的选项（插槽 `slotted`、开关的表单影子 `hiddenInput`）不经组合节点传。
