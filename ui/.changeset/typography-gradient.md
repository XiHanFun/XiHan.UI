---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

GradientText 并入 Typography：渐变字是行内文字的一档形态 `variant="gradient"`，删除 GradientText 组件。

- `TypographyVariant` 新增 `gradient`。文字前景透明、品牌渐变裁进字形；写了 `tone` 时两端取该语气的主色与压深一档；`data-contrast="more"` 作用域、系统高对比、强制色与打印下退回实色文字。
- 两端颜色与走向改由 text 部件上的覆盖槽表达：`--xh-typography-gradient-from`、`--xh-typography-gradient-to`、`--xh-typography-gradient-direction`（任意 `<angle>` 或 `to <边或角>`，缺省 `to right`）。
- 删除：Vue / React 的 `XhGradientText`、`XhGradientTextProps`，Web Components 的 `<xh-gradient-text>` 与 `XhGradientTextElement`，Headless 的 `connectGradientText`、`gradientTextAnatomy`、`gradientTextKeyboard`、`gradientTextMeta` 与 `GradientTextApi`、`GradientTextDirection`、`GradientTextProps`、`GradientTextTranslations`，皮肤子路径 `@xihan-ui/styles/gradient-text.css`，覆盖槽 `--xh-gradient-text-from` / `--xh-gradient-text-to`，以及 `data-scope="gradient-text"`。

迁移：渐变字写成 Typography 的行内文字，放在 `XhTypographyRoot`（`<xh-typography>`）里。

```vue
<!-- 之前 -->
<XhGradientText from="#f97316" to="#ec4899" direction="to-bottom-right" tone="brand">组件库</XhGradientText>

<!-- 之后 -->
<XhTypographyRoot>
  <XhTypographyText
    variant="gradient"
    tone="brand"
    style="--xh-typography-gradient-from: #f97316; --xh-typography-gradient-to: #ec4899; --xh-typography-gradient-direction: to bottom right"
  >
    组件库
  </XhTypographyText>
</XhTypographyRoot>
```

React 写法相同，`style` 传 `{ '--xh-typography-gradient-from': '#f97316', … } as CSSProperties`。Web Components 把 `<xh-gradient-text><span data-xh-part="root">…</span></xh-gradient-text>` 换成 `<xh-typography><div data-xh-part="root"><span data-xh-part="text" variant="gradient">…</span></div></xh-typography>`，两端颜色与走向同样写在 text 节点的 `style` 上。`direction` 的八个档位对应 `to right`、`to left`、`to bottom`、`to top`、`to bottom right`、`to bottom left`、`to top right`、`to top left`。
