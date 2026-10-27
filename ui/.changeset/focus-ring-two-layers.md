---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**调整** 聚焦环改成两层：1px 品牌内圈（`outline`，`--xh-ring-width` 由 2px 改为 1px，`--xh-ring-offset` 由「负一个环宽」改为 0，内圈贴着边框外沿画在元素外侧）+ 3px 品牌 30% 光环（`box-shadow`）。新增 `--xh-ring-halo`（内圈色 30%）、`--xh-ring-halo-width`（3px）与 `--xh-ring-offset-inset`（负一个环宽，给集合行、表格单元格、时间列、树行这类首尾相接的部件把内圈收进去，它们不画光环）。环压在承载面上、不随面换色：实心按钮、选中的开关轨道与日历格等原先把环换成面的前景色（`currentColor`）的规则全部撤掉，环一律是 `--xh-ring-focus`。强制色档系统去掉光环，只剩内圈。

**调整** 字段外壳静息改为白底：`--xh-bg-field` 由「淡底兑一半」改为引 `--xh-bg-surface`；聚焦时描边换成 `--xh-border-control-focus`（就是内圈）并画光环（`--xh-field-shadow-focus` 的缺省值），强制色档不再另补一圈 Highlight 环、只把描边换成 Highlight。盒里的 field-inset 钮按盒铺的底取阶梯：描边档缺省白底、走白底阶梯 100 → 200，只有淡底档没聚焦时走淡底阶梯；字段里的已选标签只在淡底档的盒里换白底。主题要回到淡底字段，改写 `--xh-bg-field`，并把字段盒上的 `--xh-action-host-bg-hover / -pressed` 改回淡底阶梯。

**调整** 自己写了 `box-shadow` 的部件，光环叠在自己的投影之前（Action Control 家族、Tabs 选中标签、Tag）；关掉环的部件（焦点由别处画）同时写 `--xh-_ring-halo: transparent` 关掉光环，浮层面板的投影照旧。Action Control 与字段外壳的过渡清单去掉 `box-shadow`，焦点环即时出现、即时撤下。
