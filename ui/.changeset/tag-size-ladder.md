---
"@xihan-ui/styles": minor
"@xihan-ui/tokens": patch
---

**标签三档整体放大一级，同档标签有没有关闭钮都一样高。**

从前三档的高全靠「一行字 + 上下内衬」，字号又只有 12 / 12 / 13 三档，缺省档带关闭钮量出来只有 22px、不带 18px，与相邻控件摆在一行里像缩了一号；现在三档各上一级：字号走 caption / secondary / body（12 / 13 / 14），行框取指示符档（sm / md 取 `--xh-control-indicator-md`、lg 取 `--xh-control-indicator-lg`）；关闭钮仍按库里「标签内移除钮以 `--xh-control-indicator-size` 为基准」的契约走，三档都是 16px。

实测（comfortable 密度，含 1px 描边）：

| 档 | 高 · 改前（无关闭钮 / 带关闭钮） | 高 · 改后 | 字号 | 上下内衬 | 左右内衬 | 关闭钮 |
| --- | --- | --- | --- | --- | --- | --- |
| sm | 14 / 18 | **22** | 12 → 12 | 0 → 2 | 6 | 16 → 16 |
| md | 18 / 22 | **26** | 12 → 13 | 2 → 4 | 8 | 16 → 16 |
| lg | 23 / 26 | **30** | 13 → 14 | 4 → 4 | 12 | 16 → 16 |

三档台阶一样宽（4px）；md 档 26px 放进 `--xh-control-h-md`（32px）的控件里不撑高；compact 密度下指示符档收一号，三档相应是 20 / 24 / 28，挂在子树上的局部 compact 也是这个数——为此令牌层的 compact 块补声明了一次别名 `--xh-control-indicator-size`：别名在 `:root` 上解析成像素后按计算值继承，子树上的 compact 原本收不动它，`select` / `tags-input` / `tag-group` 的删除钮同样受益。参照：Ant Design 默认 22 / 12px，Naive UI 22 / 28 / 34，Element Plus 20 / 24 / 32——md 落在 Naive medium 与 Element default 之间。

带来的变化：同一排里有没有关闭钮的标签从此齐平（从前带钮的高 4px）；行框由 `line-height: 1` 改成「一行字与指示符档取大者」——作者把 `--xh-tag-font-size` 调得比行框还大时行框跟着字走，`label` 的截断不会剪掉字的上下沿；`--xh-tag-close-size` 仍只管关闭钮的边长。文档站的尺寸示例改成每档并排一枚无钮、一枚带钮。

`tag-group` / `tags-input` / `select` 里各自画的标签没有套 `tag`，这一批不跟着动。
