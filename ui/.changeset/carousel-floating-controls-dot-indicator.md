---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Carousel 翻页 / 播放钮接入 Action Control floating 档，分页点改为圆点 + 当前胶囊。** 连接层的
`prev-trigger` / `next-trigger` / `autoplay-trigger` 新增稳定属性 `data-xh-action-control` /
`data-xh-action-profile="floating"` / `data-xh-action-display="always"` / `data-xh-action-size="md"`（组件没有
size 轴），不投影 `data-xh-action-variant`，面由皮肤桥接到磨砂缺省。

视觉默认变化：三颗钮的直径由 `--xh-control-h-md` 36px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
（compact 44px），面由 `--xh-bg-surface-raised` 改为 M2 磨砂四件套（`--xh-material-frosted-bg / -border /
-shadow / -backdrop` + 顶光），悬停 / 按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→
`--xh-bg-subtle-hover`（200），图标由随文 1em 改为随档 24px；到头 / 未配自动播放的隐藏改挂在 `data-disabled`
上。分页点由 16px 透明盒 + 2px 短线改为 8px 圆点（`--xh-border-default`），当前页拉长为 20px 品牌胶囊
（`--xh-bg-brand`），悬停 / 按下按前景阶梯加深；自动播放时当前胶囊改为品牌淡底轨道（新增公开槽
`--xh-carousel-indicator-bg-track`，缺省 `--xh-bg-brand-subtle`）+ 品牌填充条按停留间隔长满；粗指针下仍是
首尾相接的 44px 按钮盒分区，点与进度条改由伪元素画。新增公开槽 `--xh-carousel-indicator-radius-current`
（缺省 `--xh-shape-pill`）、`--xh-carousel-indicator-bg-active`、`--xh-carousel-indicator-bg-selected-active`、
`--xh-carousel-indicator-fg-selected`，`--xh-carousel-indicator-size` 缺省由 `--xh-space-4` 改为
`--xh-space-2`、`--xh-carousel-indicator-size-current` 缺省由 `--xh-space-6` 改为 `--xh-space-5`，
`--xh-carousel-trigger-bg-hover / -bg-active / -border / -shadow-hover` 等改为桥接到配方之前，新增
`--xh-carousel-trigger-shadow`。皮肤体积随桥接槽与分页点两套（细 / 粗指针）规则增加约 24%。
