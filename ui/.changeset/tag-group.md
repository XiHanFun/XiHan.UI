---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `tag-group` 组件（标签组）：Vue 与 Web Components 两侧同时可用。

它补的是标记族最大的一个缺口：一排可摘标签，此前只能逐枚写 `tag`，而每枚标签的关闭钮
各占一个 Tab 停靠点——十枚标签就是十个停靠点；`tag` 的文档又明令禁止把标签整块当按钮用，
却不给替代件。标签组把这一排收成**一个** Tab 停靠点：组内走方向键（roving tabindex），
摘除走 `Delete` / `Backspace`，每枚标签的 `item-delete-trigger` 一律 `tabindex="-1"`。

承诺的行为：

- **焦点有去处**。摘掉一枚之后焦点交给前一枚——摘完之后它在文档里的位置原样不动、节点必然还在；
  前面没有就交给后一枚，一枚不剩就交给列表容器（它恒在，且此刻会重新认领 Tab 停靠点）。
  鼠标点摘除钮同样按这条走，焦点不会掉回页面开头。
- **条目的去留归宿主**。`item-delete` 只报「用户要摘这一枚」，组件顺手把它从选中集合里去掉，
  节点由宿主改自己的数据摘掉——撤销、二次确认、服务端失败回滚都只有宿主知道。
- **选中是另一条独立线**。`selectionMode` 取 `none`（默认）/ `single` / `multiple`；
  方向键只搬焦点，落值要按 `Enter` / `Space`，`Ctrl`/`Cmd` + `A` 全选。
  不接选中时不发 `aria-selected`——一排纯标记标签报「未选中」是句假话。

解剖比单枚 `tag` 多一层 `cell`：摘除钮是可聚焦的按钮，而可聚焦的东西不许待在 `option`
这类控件角色里（axe 的 `nested-interactive` 会判 serious），`gridcell` 允许，所以
`list` 发 `role="grid"`、每枚标签发 `role="row"`、标签里那一格发 `role="gridcell"`。
用 `collection` 时这一层由组件自己铺开，手写部件才需要写它。

实现细节，不是承诺：这三个角色的具体取值；连打检索的取字处是 `item-text`。

每一枚标签的观感与 `tag` 同源：形态 · 语气 · 尺寸三轴写在组上，由连接层打到每一枚标签身上。
