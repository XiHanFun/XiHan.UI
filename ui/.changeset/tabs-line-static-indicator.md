---
"@xihan-ui/styles": minor
---

**标签页 `line` 档不放 `indicator` 部件时，选中标签自带一条静态指示线；横向缺省从此也和纵向一样有线。**

此前 `line` 档的 2px 指示线只由可选的滑动 `indicator` 部件画：基础用法不放它就只剩品牌字色与字重，纵向示例放了才有线。现在标签带里没有 `indicator` 部件时，选中标签在自己的 `::after` 上画一条静态线：横向贴底、纵向贴行向末端（与部件同一侧，`dir="rtl"` 随逻辑属性镜像），厚度 / 颜色 / 圆角读 `--xh-tabs-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画；放了部件即收起，不会画出两条。拖动换位时当前页作为落点的那几帧让位给落点线。`card` / `segment` 档不受影响，forced-colors 下静态线与部件同取 `Highlight`。

`tabs.css` 因此从 14233 字节涨到 16211 字节（静态线三条规则、部件在场探测与 forced-colors 一段）。设计真源 §7.3 的「导航当前页」一行随之改写：Tabs 无部件时自画静态线，Anchor / NavigationMenu 无部件时仍只靠字色与字重。
