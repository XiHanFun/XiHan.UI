---
"@xihan-ui/styles": minor
---

**新增** `resizable` 把手的可见反馈。此前八向把手在屏幕上完全不着色：指到哪一条、正在拖哪一条都看不出来。现在指针停在把手上时那一条显形（`--xh-bg-subtle-active`），正被拖的那一条换到品牌底（`--xh-bg-brand`），两档都按 `--xh-motion-duration-micro` + `--xh-motion-ease-enter` 过渡。高对比档里底色一律被系统换掉、三档会塌成一个样子，另补一条 `outline: Highlight` 把正在拖的那条画出来。

**新增** `truncate` 可展开那一档的悬停提亮。真被裁了才是那颗按钮（皮肤原本只给到 `cursor: pointer`），现在指针停在上面时字色走到 `--xh-fg-default`，按不动的短文本不给这个反馈。

**新增** `avatar` 与 `image` 的图片淡入。载入完成那一刻 `hidden` 撤掉，图片此前是硬切上来盖掉回退字 / 占位层，现在走一遍 `xh-fade-in`（`--xh-motion-duration-enter`）。两份皮肤同批同形态。

**新增** `timeline` 圆点、`button-group` 段间线、`input-group` 前后缀块的色彩过渡：语气色随数据改、整组禁用换线色、前后缀色槽换档时，都按 `micro` 走一遍而不是跳变。

**新增**门禁 `check-motion-coverage.mjs`：每份组件皮肤至少要有一条走 `--xh-motion-duration-*` 的过渡或动画（无限循环动画同样算数），剥掉 `prefers-reduced-motion` / `forced-colors` / `print` 三种块之后再判。零动效的 17 份纯排布 / 纯展示皮肤逐条登记进 `tooling/scripts/motion-exempt.json` 并写清理由，名单两侧反查。
