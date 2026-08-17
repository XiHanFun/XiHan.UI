---
"@xihan-ui/headless": minor
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

time-picker 的上午/下午在浮层里也成列：从此点得中，不必回到输入行敲。

此前 12 小时制下浮层只排时分秒三列，上下午只有输入行里那一段能改——指针用户点开浮层，
挑完时与分还得把手挪回段上，一次选值走两个地方。

- 列的单位与分段输入里的段同名同域（新增 `dayPeriod`），恒排在末位、只在 12 小时制下出现；
  两格写 `'00'` / `'01'`，与这一段在 `aria-valuenow` 上报的数同一个域，
  选中比对、写值换算于是全都复用现成的那条路，浮层里挑与段上按 a / p 落到同一个 `setTimeDayPeriod`。
- 新增 `getItemText`：格子上的文字改由它给，数字列还是格子自己的值，上下午列按 locale 译成
  「上午 / 下午」。两个适配器都改用它填文本，保证同构。
- 上下午列跟着 min / max 收窄：当前小时翻到另一半天即出界时，那一格不可选（与时列互为对方的裁剪条件）。
  这与段上按 a / p 的处置不同——段上照写只做越界标注，列里则直接裁掉，两条路本来的语义就不一样。
- 两端那一段的外角与浮层其余列一致；`granularity` 与它无关，`hour` 档也照排。

`TimePickerColumn` 因此带上了单位的类型参数（缺省仍是全集，写 `TimePickerColumn` 的地方不用改）。
date-picker 内嵌的时间面板恒为 24 小时制，用新增的 `DatePickerTimeUnit` 把「没有上下午那一列」写进类型里。

顺带把 `custom-elements.json` 与 `public-surface.json` 重新生成：前者自 number-field 的
control 部件落地起就没跟着更新过，后者漏了 kernel 的两个子路径入口。
