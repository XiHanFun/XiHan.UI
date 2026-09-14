---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增 `bar-code`（条形码）：一维码七种常用码制，三端同时可用。**

`matrix-code` 管二维码，`bar-code` 管一维码：货号、运单号、序列号、零售商品码、外箱码这些要让扫描枪一枪读出的内容。`format` 选码制——`code128`（缺省，任意 ASCII；`gs1` 打开即 GS1-128，起始符后放 FNC1，内容里的 GS 编成变长 AI 之间的分隔）、`ean13` / `ean8` / `upca` / `upce`（定长数字，校验位不给就补上、给了就核对）、`itf14`（缺省带上下承载条）、`code39`（`checksum` 附 mod 43 校验字符）。编码器自写（ISO/IEC 15417 / 15420 / 16390 / 16388），Code 128 按 GS1 通用规范的规则自动切换 A / B / C 子集与 shift；每种码制都配了独立重写的解码器做回环。

几何走一个 `<svg>`：全部条合成一条 `<path>`，人读文字（`text`，缺省印）每段一个 `<text>`，EAN / UPC 的数字逐位落在自己那格下面、守卫条按规范延长 5X。`barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。内容不合码制规则（字符不在字符集、位数不对、校验位对不上）或码制不认识时一根条都不铺，根落到 `error` 态并在 `error` 里说明——画一张扫出错内容的码比不画更坏。对当前码制没有意义的选项（`gs1` 给了非 code128、`checksum` 给了非 code39、`bearerBars` 给了非 itf14）往诊断通道报一条 `bar-code.option-ignored` 警告，按没给处理。

皮肤 `bar-code.css`：条色与底色取固定档（`--xh-bar-code-fg` / `--xh-bar-code-bg`），深色主题下不反相；人读文字走等宽字体（`--xh-bar-code-font-family`）。自定义元素 `<xh-bar-code>` 作者只写一个空的 `<svg data-xh-part="root">`。
