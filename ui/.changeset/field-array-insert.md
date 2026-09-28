---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

FieldArray 新增在指定位置插入 `insert(index, item?)`，Web Components 补上命令式方法。

- `insert(index, item?)`（Vue 插槽作用域 / React 函数式 children 的 `insert`）：在 `index` 处插入一行（取整后夹到 0 到行数之间，等于行数即追加），后面的行往后挪；给了 `item` 就用它作这一行的数据，缺省由 `createItem` 造。与 `add` 同受 `max` 与禁用、只读约束；新行拿一个没用过的行号，前后各行的号不动；嵌在 Form 里时后面各行的值、规则与错误随之后移。
- `ITEM.ADD` 事件新增可选 `index` 与 `item`；headless 导出 `fieldArrayInsertIndex`。
- Web Components 元素新增 `setValue()`、`add()`、`insert()`、`removeItem()`、`move()`、`moveUp()`、`moveDown()` 方法，与另外两端交出的命令一致（删行叫 `removeItem`：`remove` 是 Element 自己的方法）；`move(from, to)` 可以一步挪到任意位置。
