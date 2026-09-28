# 导航菜单

用于站点顶部的多级导航菜单。

## 何时使用

- 门户、营销站或文档站具有多组导航链接。

## 何时不用

- 操作命令使用[菜单](./menu)。
- 后台层级导航使用[侧栏导航](./side-nav)。
- 面板里的子级还要再往下分层时，同样改用[侧栏导航](./side-nav)。

## 特性

- 支持横向和竖向排列、延迟展开与键盘导航。
- 没有子级的入口可直接渲染为链接。
- 面板里的条目可以再带一层子级：`branch-trigger` 展开紧跟其后的 `branch-content`，行尾的 `branch-indicator` 随之转向下方。同一张面板只展开一枝；子级是面板里的一段，不另起浮层、不动高度、不播展开动画。
- 每次展开面板都按当前页重新落定子级：当前页链接所在的那一枝展开，其余收起，打开面板就看得到自己在哪。
- 给了 `collection` 又没写结构时，入口的 `children` 铺成面板，面板条目的 `children` 铺成一枝子级；子级里只放带 `href` 的链接，不再往下嵌套。`value` 全树唯一，不合法的嵌套当场报错。
- `viewport` 可让所有面板在同一位置切换。
- 当前链接使用 `aria-current="page"`，并自带一条静态指示线（横排的直达链接贴底边，竖排与面板里的链接贴起始缘）；`indicator` 部件指的是开着的面板，两者各说各的。

## 无障碍

- 子级开关是原生按钮，`aria-expanded` / `aria-controls` 指向子级；子级收着时带 `hidden`、被 Tab 整段跳过，展开后 Tab 顺着文档序走进去。
- 焦点在子级里按 Escape 只收起这一枝、焦点回到它的开关，再按一次才收起面板。

## 组合

- 窄屏时切换为抽屉或侧栏导航，不压缩顶部入口。

## 接路由

- Vue / React 的 `link`（直达链接与面板里的链接）缺省渲染 `<a>`，`href` 由作者写或取自 `collection`。接客户端路由时给 `XhNavigationMenuLink` 加 `asChild`，把路由链接放进去当唯一的子节点：部件属性与按压接线合到它渲出的元素上，跳转交给路由，点击后照常收起面板；子节点不是恰好一个元素时直接报错。
- 当前页由作者按路由判定后写 `current`。
- Web Components 不需要 asChild：`link` 本来就是作者写的节点，元素只往它身上写属性与监听、不替换它。路由库自己的链接元素，或自行拦截点击的 `<a>`，直接标 `data-xh-part="link"` 即可。

```vue
<XhNavigationMenuLink :current="route.path === '/docs'" as-child>
  <RouterLink to="/docs">文档</RouterLink>
</XhNavigationMenuLink>
```

```tsx
<XhNavigationMenuLink current={pathname === "/docs"} asChild>
  <Link to="/docs">文档</Link>
</XhNavigationMenuLink>;
```

## 最佳实践

- 使用短标题和简洁说明组织链接。
- 保留默认展开延时，避免指针经过时连续闪动。

## 反模式

- 不要在导航面板中放置表单或一次性命令。
- 不要在窄屏中强行保留完整横向导航。
