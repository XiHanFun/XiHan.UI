---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

TextField 的字数与 `maxLength` 改按字素计。

- `count`、`atLimit` / `data-at-max` 与 `maxLength` 的截断都按字素计（`Intl.Segmenter`）：组合 emoji、国旗与带变音符的字母各算一个字。此前 `count` 按码点、上限按 UTF-16 码元，一个 emoji 在上限里要占两个以上的位置，与显示的字数对不上。只含常用汉字与拉丁字母的文本行为不变。
- 输入框不再投影原生 `maxlength`（它按 UTF-16 码元计）。一次编辑超出上限时，连接层截掉这次新插入的文本里放不下的那一截，光标前后原有的内容不动、光标落在保留下来的文本之后，与原生 `maxlength` 的做法一致；输入法组合期间不截，`compositionend` 时再按上限收住。作者的 `setValue` 与受控值照旧截尾巴。
- 引擎没有 `Intl.Segmenter`（Firefox 125 之前）时退化成按码点计，写进支持面的可选增强层表。
- headless 导出 `fitToMaxLength` 与类型 `TextFieldFitResult`；`VALUE.SET` 事件新增可选 `composing`。
