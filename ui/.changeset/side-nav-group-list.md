---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

SideNav 的分组改成合法的列表结构。原先 `group` 渲染成 `<li role="group" aria-labelledby>`，组内的 `item` / `branch` 直接挂在这个 li 里：外层 `<ul>` 的直接子节点多了一个 role=group（axe `list`），组内的 `<li>` 父节点又不是列表（axe `listitem`），读屏既念不出列表项数，也念不对分组。现在 `group` 仍是上一层列表里的一条 `<li>`，不再带 `role` 与 `aria-labelledby`；新增部件 `group-list`（`<ul>`），放在 `group-label` 之后，组内的行挂在它里面，由它以 `aria-labelledby` 指向组标题，读屏念作「标题 + 列表」。不写 `role="group"`：列表项的父节点只能是列表，把 role=group 挪到 ul 上同样会拆散组内的行。搜索时整组收起、折叠态的标题淡出与细分隔、方向键走位与成员收集都不变；新结构下标题与行的落位、宽度、间距与计算样式都与原来一致。

- Headless：anatomy 新增 `group-list`；新增 `api.getGroupListProps({ value })`；`getGroupProps` 不再输出 `role` / `aria-labelledby`。
- Vue / React：新增 `XhSideNavGroupList`（React 另有 `XhSideNavGroupListProps`），分组身份取自所在的 `XhSideNavGroup`，不用写 `value`；放在分组外直接报错。
- Web Components：新增作者角色 `data-xh-part="group-list"`，分组身份认所在的 `group`。
- 样式：`group-list` 与 `list`、`branch-content` 同一副列表排法（flex 纵排、`--xh-side-nav-gap`、无 UA 缩进与外边距），`--xh-side-nav-gap` 多了一个消费部件。

迁移：在每个分组里，把 `group-label` 之后的条目包进一层 `group-list`。

```vue
<XhSideNavGroup value="main">
  <XhSideNavGroupLabel value="main">常用</XhSideNavGroupLabel>
  <XhSideNavGroupList>
    <XhSideNavItem>…</XhSideNavItem>
    <XhSideNavBranch value="users">…</XhSideNavBranch>
  </XhSideNavGroupList>
</XhSideNavGroup>
```

React 写法同上（`<XhSideNavGroupList>` 包住组内的 `XhSideNavItem` / `XhSideNavBranch`）。Web Components：

```html
<li data-xh-part="group" value="main">
  <div data-xh-part="group-label">常用</div>
  <ul data-xh-part="group-list">
    <li data-xh-part="item">…</li>
  </ul>
</li>
```

直接调 headless 的作者：分组 li 照旧取 `getGroupProps({ value, members })`，新加的 ul 取 `getGroupListProps({ value })`；依赖 `[data-part='group'][role='group']` 的自定义样式或测试改认 `[data-part='group-list']`。
