---
"@xihan-ui/vue": minor
---

补两条 Vue 侧的逃生口：只注册不渲染的快捷键，以及控件藏在薄封装里的字段接线。

**新增 `useHotkeys`**。此前 hotkeys 只有渲染键帽的组件形态，全局快捷键（Ctrl+K 开搜索、Alt+L 锁屏）只想要注册、不想要键帽，只能自己写原生 `keydown` 监听——还得自己处理 Mac 上 Option 会改 `event.key`、必须用 `event.code` 兜底这类事。

组件里那段「算 API + 挑监听节点 + 绑 keydown + 解绑」整段移进组合式，`XhHotkeys` 改成它的消费者，一份逻辑两种形态。`target` 除组件已有的 `'document'` / `'parent'` 外，还收一个返回节点的函数，用于挂在滚动容器或 `window` 上。一次调用管一组组合，注册四条就调四次——与组件形态一比一对齐，免得两种形态的 `preventDefault` / `enabled` / `platform` 语义各走各的。

`XhHotkeys` 的 props、emits 与渲染结果一个都没变。

**`XhFieldControl` 新增 `asChild`（默认 `true` = 今天的行为）与配套的 `useFieldControl`**。字段默认把接线属性合到控件槽里唯一的子节点上；子节点是组件时合的是组件根，而薄封装的根往往是 `div`。标签的 `for` 只对可标注元素生效，指到 `div` 上什么也不会发生——点标题聚不了焦、读屏报不出名字，**而且不报错**。

现在封装内部调 `useFieldControl()` 取到那组属性，绑到真正可聚焦的节点上，外层写 `:as-child="false"` 让父节点别再合一遍（合两遍会在页面上留下两个相同的 `id`）。`useFieldControl` 在字段外返回空对象，封装照样能单独用。

`asChild` 这个词是库里现成的——13 个组件的触发器都用它表示「把属性合到作者的子节点上」，这里语义一致，只是这个部件此前把它写死成了真。

顺带导出此前一直漏在包外的 `provideField` / `useFieldContext`，并新增 `useOptionalFieldContext`。

Web Components 侧不需要对应改动：那边是 Light DOM，作者本来就把 `data-xh-part="control"` 写在真控件上。
