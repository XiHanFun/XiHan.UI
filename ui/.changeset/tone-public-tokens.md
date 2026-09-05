---
"@xihan-ui/styles": minor
---

**语气轴出 11 支公开令牌 `--xh-tone-*`，使用者的节点也能接语气。**

此前语气层只声明私有槽 `--xh-_tone*`：库里的组件消费得到，使用者在自己的节点上接不到——`grep -o "--xh-tone-[a-z0-9-]*" packages/` 零命中，想让一块自定义卡片跟着 `danger` 走，只能把颜色写成裸值，六族语气、深浅两态、换过品牌色之后的取值一处都不跟。

现在写了 `data-tone` 的节点上多出这一族，一支对一支指向同名私有槽，取值恒等：

| 令牌 | 是什么 |
| --- | --- |
| `--xh-tone-solid` · `--xh-tone-solid-hover` · `--xh-tone-solid-active` | 实心底与它的两个交互态 |
| `--xh-tone-on` | 实心底上的前景色 |
| `--xh-tone-subtle` · `--xh-tone-subtle-hover` · `--xh-tone-subtle-active` | 淡底与它的两个交互态 |
| `--xh-tone-fg` | 普通背景上表达该语气的文字色 |
| `--xh-tone-border` · `--xh-tone-border-control` · `--xh-tone-soft` | 描边、可操作区边界、装饰性强调 |

`--xh-_tone-shift` 是兑色的方向、不是一档能直接用的颜色，不出公开令牌。

选择器仍是 `[data-tone]`，没有新开属性；私有槽与各族的推导一条没动，既有渲染逐像素不变。这一族只在写了 `data-tone` 的节点及其后代里有取值。`tone.css` 因这 11 条声明从 3297 涨到 3799 字节（去注释压空白后），逐皮肤体积基线随之更新。

新增门禁 `check-tone-tokens`：公开令牌必须声明在语气层的 `[data-tone]` 或 `:root` 上（落在某个组件皮肤里等于没出这支令牌），取值必须恰好是对应私有槽，且私有槽与公开令牌两侧的名册对齐——新加一支语气私有槽而不出公开令牌会被拦下。
