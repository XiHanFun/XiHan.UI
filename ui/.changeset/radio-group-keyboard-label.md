---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

RadioGroup 的方向键只接落在条目或根节点自身上的按键，并跳过内层已 `preventDefault` 的事件：组里摆着的数字框、下拉等行内编辑控件，方向键照常移光标、换值，不再被当成切换选项。

根节点只在 `label` 部件真渲染了时才输出 `aria-labelledby`（新增由适配器统计的 `labelled`），不再指向不存在的节点；Vue / React 的 `label` 属性在手写选项时同样铺出标题，与文档「提供后不必再写 label 部件」一致。
