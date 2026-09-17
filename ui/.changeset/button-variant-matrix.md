---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Button 接入 Action Control 形态矩阵，缺省形态显式落 solid。** 连接层的 root 新增稳定属性
`data-xh-action-variant`，与 `data-variant` 同源；不传 `variant` 时两者都投影 `solid`——只有 Button
缺省品牌实心（真源 §7.2 第 2 条），不再存在「不传 variant」的第五种形态。皮肤删除四档形态自写的
底 / 前景 / 描边、深色品牌实心覆盖与焦点 / 加载回落品牌面的规则，颜色全部由家族形态矩阵给出；公开槽
`--xh-button-bg / -bg-hover / -bg-active / -fg` 改为桥接到矩阵之前（使用者槽 → 形态矩阵 → 家族缺省），
只有 solid 一档保留已登记的顶光、贴地软影与悬停 raised。视觉默认变化：ghost / outline 的按下面由
`--xh-bg-subtle-active`（300）改为家族阶梯的 `--xh-bg-subtle-hover`（200，白底承载 hover 100 → pressed
200）；subtle 的静息描边由 `--xh-material-soft-border` 改为透明占位边（§8.3 淡底面）。实心面的双环焦点
选择器改按 `data-xh-action-variant='solid'` 命中。
