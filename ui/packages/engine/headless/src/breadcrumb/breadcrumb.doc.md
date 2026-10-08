# 面包屑

显示当前页面在信息层级中的位置。

## 何时使用

- 页面具有明确的父子层级。
- 用户可能从搜索或外链直接进入深层页面。

## 何时不用

- 扁平页面不需要面包屑。
- 流程进度使用[步骤条](./steps)。

## 特性

- `collection` 可直接生成完整路径，也支持手写部件。
- `maxItems` 将过长路径的中间层折叠为一个省略位。省略位里的 `ellipsis-trigger` 是被折叠层级的入口：它是一枚按钮，键盘可达、读屏念出 `translations.ellipsis`（缺省 Show full path），按下即就地展开完整路径，省略位收起，焦点落到第一条展开出来的链接上；展开后不再折回。
- Vue / React 由 `collection` 铺开时自动折叠与展开；Web Components 把完整路径逐层写成部件，在首层之后放一个装着触发器的省略位，元素按 `max-items` 收起中间层，展开后放出来。
- 默认分隔符为一条斜线，可通过插槽或渲染函数替换。
- 当前页使用 `aria-current="page"`，不参与键盘导航。

## 组合

- 通常放在页头或正文标题之前。
- `ellipsis` 是路径里的一个列表项，里面放 `ellipsis-trigger`；触发器不写内容时由皮肤画一枚省略号字形，写了内容即换成作者的，可及名始终取 `translations.ellipsis`。被收起的层级与展开后的省略位带 `hidden`，紧跟在它后面的分隔符由皮肤一并收起。

## 接路由

- Vue / React 的 `link` 缺省渲染 `<a>`，`href` 由作者写或取自 `collection`。接客户端路由时给 `XhBreadcrumbLink` 加 `asChild`，把路由链接放进去当唯一的子节点：部件属性与按压接线合到它渲出的元素上，跳转交给路由；子节点不是恰好一个元素时直接报错。
- 当前页那条部件照样对点击 `preventDefault`、退出 Tab 序列；路由链接跳往当前路由本来也是空操作。
- Web Components 不需要 asChild：`link` 本来就是作者写的节点，元素只往它身上写属性与监听、不替换它。路由库自己的链接元素，或自行拦截点击的 `<a>`，直接标 `data-xh-part="link"` 即可。

```vue
<XhBreadcrumbItem>
  <XhBreadcrumbLink value="orders" as-child>
    <RouterLink to="/orders">订单</RouterLink>
  </XhBreadcrumbLink>
</XhBreadcrumbItem>
```

```tsx
<XhBreadcrumbItem>
  <XhBreadcrumbLink value="orders" asChild>
    <Link to="/orders">订单</Link>
  </XhBreadcrumbLink>
</XhBreadcrumbItem>;
```

## 最佳实践

- 当前项使用清晰的页面标题，避免“详情”等泛化名称。
- 同页有多个 `nav` 地标时给面包屑单独的 `aria-label`。

## 反模式

- 不要用面包屑表示浏览历史。
- 当前项不要链接到自身。
