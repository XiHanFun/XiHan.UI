---
"@xihan-ui/styles": minor
---

**导航菜单里指向当前页面的链接自带一条静态指示线。**

设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」。导航菜单的 `indicator` 部件指的是「哪张面板开着」而不是当前页（写了 `current` 的是 `link`），此前当前页只靠品牌字色与字重。现在当前链接在自己的 `::after` 上画一条静态线，不随部件收起、两者各说各的：横排 list 里的直达链接贴底边，竖排的直达链接与面板里的链接贴行向起始缘（`dir="rtl"` 随逻辑属性镜像），主轴两端各退 `--xh-space-1` 避开链接的圆角；厚度 / 颜色 / 圆角读 `--xh-navigation-menu-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画。forced-colors 下静态线与 `indicator` 部件同取 `Highlight`（部件此前在这一档整根消失）。

`navigation-menu.css` 实测从 10374 字节涨到 11383 字节（基线原登记 10952 已过期，随之重落）。
