---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

徽标收窄成「只做角标」，并补齐角标该有的能力。

原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

现在 badge 只做一件事——挂在别的元素角上的一枚标记：

```vue
<XhBadge :count="5" tone="danger" label="5 条未读">
  <XhButton>收件箱</XhButton>
</XhBadge>
```

- 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
  不再要宿主手写 `position: relative` 与负偏移。
- 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
  用逻辑属性写，rtl 下自动落到另一侧。
- `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
- Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

**破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
`data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。
