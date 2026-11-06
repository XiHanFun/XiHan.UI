---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

**修复** `useFieldControl()` 交出的接线属性里带着字段的皮肤挂载类 `xh-scope-field`：把它绑到别的组件上时（如用 Button 做字段的触发钮、上传钮），那个组件的根自带 `data-part="root"`，两者凑在一起正好被字段根的皮肤选中，按钮变成纵向排布，文字跑到上方居中。`XhFieldControl` 的 asChild 合并早就把挂载类让掉了，`useFieldControl` 这条路径漏了。

现在 `useFieldControl()` 只交出 id、aria-* 与状态位，解剖两位、家族标记与皮肤挂载类一起剔掉。绑到原生元素上的写法不受影响：那个元素没有字段的解剖标记，挂载类本来也选不中任何规则。Vue 与 React 两端同步生效。
