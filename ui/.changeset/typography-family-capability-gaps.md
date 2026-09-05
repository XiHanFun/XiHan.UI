---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**排版与文字效果族补齐八项能力：富文本排版真源、两条轴、两处语气、行数槽、受控暂停、图标八档直径与旋转翻转。全部是加法，既有写法一行不动。**

`typography` 多了一个 `prose` 部件——这是库里第一份富文本排版真源。`@xihan-ui/markdown` 与 `markdown-stream` 产出的整段 HTML 套进它就有排版：标题六档字号与 `heading` 部件同源、段与段之间只留一份间距、列表缩进、行内代码与 `text` 的 `code` 形态同源、代码块自己成一片面并横向滚动、引用带起始描边、图片不撑宽容器、表格行线到底。标签选择器一律包在 `:where()` 里，块内嵌 XiHan 组件时那份皮肤仍然赢。两个适配器分别是 `XhTypographyProse` 与 `data-xh-part="prose"`。

`typography` 同批补 `align`（start / center / end / justify）与 `weight`（regular / medium / semibold / bold）两条轴，落在 `root` 上整块一起换；`weight` 也能只写在一段行内文字上，排在形态之后——与 `variant="strong"` 同写时粗到哪一档由它说了算。

`highlight` 补 `tone`，落在 `root` 而不是 `mark` 上：一段里的命中片段有好几个，用哪族颜色是整段的属性。`mark` 的字重同批开出 `--xh-highlight-mark-font-weight`。

`gradient-text` 补 `tone`：两端取该族主色与它压深一档的取值，深浅两态自动跟随；排在 `from` / `to` 之后，作者写了两端颜色即以作者为准。

`truncate` 的行数开出 `--xh-truncate-lines`，排在连接层写的内联私有槽前面——在外层写一句即可整片改档。

`marquee` 补受控暂停 `paused` → `data-paused`，排在悬停两条之后：作者说了停就停，指针离开也不会把它带回去走。`speed` 的口径同批在文档里说清——它按 `--xh-marquee-span` 换算成一圈时长，要逐字对上每秒像素数就把这支槽改到内容的真实长度。

`icon` 的 `size` 从三档放宽到八档 `IconSize`（`text` / `sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `4xl`，逐档对应 `--xh-glyph-size-*`，`text` 跟着相邻文字的字号走），缺省仍是 `md`；同批补 `rotate`（90 / 180 / 270 三档，其余值不写出）与 `flip`（horizontal / vertical / both），两者是独立属性可以叠加。翻转的 `scale: -1` 登记进 `check-motion-amplitude` 的 `STATIC_GEOMETRY`：翻转是几何不是幅度，减弱动效档压成 1 等于把翻转撤掉。
