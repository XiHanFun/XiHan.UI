# 侧栏导航

用于组织应用的主要导航入口。

## 何时使用

- 管理后台或控制台的主导航。
- 导航包含分组或可展开的子级。

## 何时不用

- 顶部横向导航，使用[导航菜单](./navigation-menu)。
- 文件或组织结构，使用[树](./tree)。

## 特性

- 支持分组、嵌套分支与当前项高亮：当前项铺品牌淡底行面、字取淡底前景，不另画指示条；通往当前项的展开分支只落与悬停同档的中性面。
- `accordion` 限制同一层级只展开一个分支。
- 入口可逐条声明语气，不向下传导；当前项的品牌淡底压过它。
- 折叠后保留图标入口，子级在浮层中展示。
- 方向键上下移动，左右键展开或收起分支。

## 无障碍

- `list` 与 `branch-content` 使用列表语义。
- 将文字放入 `branch-text` 或 `link-text`，确保折叠后仍有可访问名称。
- 装饰图标使用 `aria-hidden="true"`。

## 组合

- 放入[布局](./layout)的侧栏区域。

## 接路由

- Vue / React 的 `link` 缺省渲染 `<a>`，`href` 由作者写或取自 `collection`。接客户端路由时给 `XhSideNavLink` 加 `asChild`，把路由链接放进去当唯一的子节点：部件属性、按压与聚焦接线合到它渲出的元素上，跳转交给路由；子节点不是恰好一个元素时直接报错。
- 当前项跟着路由走：把当前路径换算成 `value` 受控传入。点选只发 `value-change`，真正的当前项仍以路由为准。
- Web Components 不需要 asChild：`link` 本来就是作者写的节点，元素只往它身上写属性与监听、不替换它。路由库自己的链接元素，或自行拦截点击的 `<a>`，直接标 `data-xh-part="link"` 即可。

```vue
<XhSideNavLink value="orders" as-child>
  <RouterLink to="/orders">
    <XhSideNavLinkText>订单</XhSideNavLinkText>
  </RouterLink>
</XhSideNavLink>
```

```tsx
<XhSideNavLink value="orders" asChild>
  <Link to="/orders">
    <XhSideNavLinkText>订单</XhSideNavLinkText>
  </Link>
</XhSideNavLink>
```

## 最佳实践

- 导航层级保持在两到三级。
- 折叠模式下为每个入口保留清晰图标。

## 反模式

- 不要为单个入口创建分支。
- 不要在折叠时卸载导航树。
