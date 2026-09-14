---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**虚拟列表的区间回调改名：`onChange` → `onRangeChange`，事件 `change` → `range-change`，载荷类型 `VirtualizerChangeDetails` → `VirtualizerRangeChangeDetails`。**

`change` 在库里是「值变了」的名字，虚拟列表回的却是该渲哪一段——同一个名字两种含义，作者在表单里同时接 `@change` 时分不清是哪一路。现在按它真回的东西取名。三个适配器同步：Vue `@range-change`、React `onRangeChange`、自定义元素 `range-change` 事件；载荷不变（`virtualItems` / `totalSize` / `startIndex` / `endIndex`）。
