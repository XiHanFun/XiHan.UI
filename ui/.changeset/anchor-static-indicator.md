---
"@xihan-ui/styles": minor
---

**锚点目录不放 `indicator` 部件时，当前那一节的链接自带一条静态指示线。**

设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」，标签页已经在没放部件时自画静态线，锚点此前没放部件就只剩品牌字色与字重。现在目录里没有 `indicator` 部件时，当前链接在自己的 `::after` 上画一条静态线：竖排贴链接的行向起始缘（与部件同一侧，`dir="rtl"` 随逻辑属性镜像）、横排贴底边，主轴两端各退 `--xh-space-1` 避开链接的圆角（链接为省略号收着 overflow，贴满会被切角），厚度 / 颜色 / 圆角读 `--xh-anchor-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画；放了部件即收起，不会画出两条。部件骑在 list 的轨道上、静态线画在链接盒内，两者同侧、差一线宽；嵌套目录里子级链接的静态线随自己的缩进走。forced-colors 下静态线与部件同取 `Highlight`。

`anchor.css` 因此从 4457 字节涨到 5329 字节（静态线三条规则、部件在场探测与 forced-colors 一段）。
