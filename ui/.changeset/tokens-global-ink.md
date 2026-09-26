---
'@xihan-ui/tokens': minor
---

缺省面同样用墨色表达描边与淡底：浅色 / 深色主题块里新增 `--xh-ink`（主题极性的纯黑 / 纯白），`--xh-border-default`、`-subtle`、`-strong`、`-control-hover` 与 `--xh-bg-subtle`、`-subtle-hover`、`-subtle-active`、`--xh-bg-muted` 写成墨色按比例透明。作者自己的彩色区块即使不声明域，描边与淡底也是底色自身的深浅变体。

比例按「与原中性色对比度相等」求：描边在页面底、画布、缺省面与 elevated 面上各求一个取最大值，哪种面上都不比原来淡（浅色档与原值一致，深色档 22%，卡片面上略重）；淡底只按缺省面求（浅色 4.3%、深色 6.2%），压在上面的字、对号与焦点环对比度不降。置灰字属于文字，缺省面上保持实色，只在墨色域里取墨色。高对比档的描边仍取实色。

新增不透明档 `--xh-bg-subtle-opaque`、`--xh-bg-subtle-hover-opaque`、`--xh-bg-subtle-active-opaque`、`--xh-bg-muted-opaque` 与 `--xh-border-default-opaque`：同一比例的墨色叠在缺省面上的实色，给要盖住下层内容的面与压在任意内容上的框用；它们在缺省面上与原来的中性色逐值一致。
