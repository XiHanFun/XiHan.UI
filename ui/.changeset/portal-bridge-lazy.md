---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

Portal 视觉桥只在浮层呈现期间存在。此前每个浮层定位层一挂载就建桥：在来源整条祖先链上挂观察、建时把候选自定义属性读一遍，页面上几十个关着的提示与下拉白付这笔账，含几十个提示的面板一打开就多出数万次计算样式读取；缓存页一进一出，页内每台桥还要各重算两遍。现在 Vue 与 React 的内部 `XhPortal` 多一个 `present`（缺省为真，常显与展开才渲染的落点不变），带退场闸门的浮层（Tooltip、Popover、HoverCard、Popconfirm、Menu、ContextMenu、Select、Combobox、Cascader、TreeSelect、Mention、ColorPicker、DatePicker、DateRangePicker、TimePicker、TimeRangePicker、FloatingPanel、Pagination、Tour）把可见与否交给它：关着时不建桥，转为呈现时在内容露出、定位引擎第一次量尺寸之前建桥，退场播完后撤掉。Web Components 不经视觉桥，不受影响。
