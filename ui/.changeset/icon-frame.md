---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

IconWrapper 并入 Icon：图标新增 `frame` 底框，删除 IconWrapper 组件。

- `IconProps` 新增 `frame?: ActionVariant`（`solid` / `subtle` / `outline` / `ghost`），不写即无框；root 上落 `data-frame`。框画在 `<svg>` 自己的盒上，圆形；sm / md / lg 三档直径取 `--xh-control-h-sm/md/lg`，与同档 Avatar 一样大，图元按 `size` 取字形直径居中。其余五档（text、xl、2xl、3xl、4xl）的框沿用 md 档的内衬厚度。
- `tone` 同时决定框的配色：实心取语气主色与反白前景，淡底取语气淡底与语气文字色，描边取语气描边；不写 `tone` 时实心为品牌色、其余为中性。框只认图标自己身上的 `data-tone`，放在语气容器里的无语气框保持中性。
- 框里的图元不读外层下发的 `--xh-icon-size`，落在按钮、提示条这类统一图元直径的容器里也按自己的档位。
- 新增覆盖槽：`--xh-icon-frame-size`、`--xh-icon-frame-glyph-size`、`--xh-icon-frame-radius`、`--xh-icon-frame-bg`、`--xh-icon-frame-border`、`--xh-icon-frame-shadow`；框的前景沿用 `--xh-icon-fg`。
- 可及名与装饰态不因加框改变。
- 删除：Vue / React 的 `XhIconWrapper`、`XhIconWrapperProps`，Web Components 的 `<xh-icon-wrapper>` 与 `XhIconWrapperElement`，Headless 的 `connectIconWrapper`、`iconWrapperAnatomy`、`iconWrapperKeyboard`、`iconWrapperMeta` 与 `IconWrapperApi`、`IconWrapperProps`、`IconWrapperTranslations`，皮肤子路径 `@xihan-ui/styles/icon-wrapper.css`，覆盖槽 `--xh-icon-wrapper-*`，以及 `data-scope="icon-wrapper"`。

迁移：把底座的三个轴搬到图标自己身上，`variant` 改名 `frame`。

```vue
<!-- 之前 -->
<XhIconWrapper variant="subtle" tone="brand" size="lg">
  <XhIcon :icon="FolderIcon" />
</XhIconWrapper>

<!-- 之后 -->
<XhIcon :icon="FolderIcon" frame="subtle" tone="brand" size="lg" />
```

Web Components 把 `<xh-icon-wrapper variant="subtle"><span data-xh-part="root"><xh-icon>…</xh-icon></span></xh-icon-wrapper>` 换成 `<xh-icon frame="subtle">…</xh-icon>`。原先不写 `variant` 的 IconWrapper 是中性淡底，对应 `frame="subtle"`。覆盖槽对应：`--xh-icon-wrapper-size` → `--xh-icon-frame-size`、`--xh-icon-wrapper-glyph-size` → `--xh-icon-frame-glyph-size`、`--xh-icon-wrapper-radius` → `--xh-icon-frame-radius`、`--xh-icon-wrapper-bg` → `--xh-icon-frame-bg`、`--xh-icon-wrapper-shadow` → `--xh-icon-frame-shadow`、`--xh-icon-wrapper-fg` → `--xh-icon-fg`。
