---
"@xihan-ui/designer-shell": minor
---

**新增** 零件 `<xh-designer-outline>`：页面结构，按树列出模板里的容器、分组与元素。属性 `nodes`（`{ id, label, description?, icon?, children?, selectable?, movable?, deletable? }`）、受控的 `selection`、`allowMove`、`searchable`、`readonly`、`headless`；事件 `node-select`、`node-highlight`（悬停或焦点所在的行，离开时为 `null`）、`node-delete`、`node-move`。键盘与读屏照 `<xh-tree>`：整棵树一个 Tab 位，Enter 选中，Delete 删除，Alt + 方向键挪动或改层级；行尾的删除钮只接指针。文案新增 `xh-designer-outline` 一桶，十种语言都有。
