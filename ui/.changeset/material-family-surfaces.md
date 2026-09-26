---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

新增材质家族配方 `@xihan-ui/styles/material.css`：投影了 `data-xh-material="frosted"` 的部件从同一份配方取 frosted 面——描边、底、1px 顶光、前景、投影与背景滤镜，覆盖槽 `--xh-frosted-bg/-border/-fg/-shadow/-backdrop/-highlight`。Cascader、Combobox、ContextMenu、FloatingPanel、HoverCard、Mention、Menu、Menubar、Popconfirm、Popover、Select、TreeSelect 的内容面改由它画，组件原有的覆盖槽照常生效。Menu、Select 等 8 个列表浮层的 1px 顶光由伪元素改画在背景最上一层：列表滚动时不再跟着内容滚走。
