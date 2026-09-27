# 导航菜单

用于站点顶部的多级导航菜单。

## 何时使用

- 门户、营销站或文档站具有多组导航链接。

## 何时不用

- 操作命令使用[菜单](./menu)。
- 后台层级导航使用[侧栏导航](./side-nav)。

## 特性

- 支持横向和竖向排列、延迟展开与键盘导航。
- 没有子级的入口可直接渲染为链接。
- `viewport` 可让所有面板在同一位置切换。
- 当前链接使用 `aria-current="page"`，并自带一条静态指示线（横排的直达链接贴底边，竖排与面板里的链接贴起始缘）；`indicator` 部件指的是开着的面板，两者各说各的。

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
<XhNavigationMenuLink current={pathname === '/docs'} asChild>
  <Link to="/docs">文档</Link>
</XhNavigationMenuLink>
```

## 最佳实践

- 使用短标题和简洁说明组织链接。
- 保留默认展开延时，避免指针经过时连续闪动。

## 反模式

- 不要在导航面板中放置表单或一次性命令。
- 不要在窄屏中强行保留完整横向导航。
