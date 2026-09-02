---
"@xihan-ui/styles": major
"@xihan-ui/web-components": major
---

**「当前项」的前景色与字重收成一套槽名。** `anchor` / `breadcrumb` / `navigation-menu` 三家画的都是 `[data-current]` 那一行，槽名却是三套：使用者写一条规则改「当前项」的颜色，只能命中三分之一。

统一到 `--xh-<组件>-link-fg-current` / `--xh-<组件>-link-font-weight-current`，也就是本库槽名的常规构词 `--xh-<组件>-<部件段>-<属性>-<状态>`：部件段是规则真正作用的那个 `link` 部件，状态段是 `current`。`navigation-menu` 已经是这个写法，不动。

`anchor` 的 `-active` 尤其要换掉：`active` 在本库已经被 `:active` 按压态占着（`--xh-download-trigger-bg-active`、`--xh-back-top-bg-active` 这一族），列表族的强档 `-bg-active` 又表达展开路径，同一个词已经一名二义，用它再表示「当前项」是第三义，而且与相邻的按压态槽读起来完全一样。

**默认渲染逐像素未变。** 四个旧名本来只占兜底位的槽名，取值来源没动。

**破坏性：下列 4 个公开槽已删，设它们不再有任何效果。**

| 已删的旧名 | 换成 |
| --- | --- |
| `--xh-anchor-link-fg-active` | `--xh-anchor-link-fg-current` |
| `--xh-anchor-link-font-weight-active` | `--xh-anchor-link-font-weight-current` |
| `--xh-breadcrumb-current-fg` | `--xh-breadcrumb-link-fg-current` |
| `--xh-breadcrumb-current-font-weight` | `--xh-breadcrumb-link-font-weight-current` |
