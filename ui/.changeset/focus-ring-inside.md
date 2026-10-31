---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**调整** 聚焦环一律画在元素自己的盒内：一道 2px 品牌实线（`--xh-ring-width`，`--xh-ring-offset` 为负一个环宽），外沿与边框外沿重合，不出盒、不被裁切容器裁掉，应用侧不必给它留位；不随语气，即时出现。实心面上的环不再换成面的前景色（`currentColor`），环色一律是 `--xh-ring-focus`，改在环内侧衬一道 1px 底色间隔线：新增 `--xh-ring-gap`（取承载面底色）与 `--xh-ring-gap-width`（1px）。实心按钮与实心标签、勾中的方框、选中的开关轨道、日历选中格、轮播点、色块、热力图格、滚动条拇指、缩放把手衬这道线；Action Control 家族在打了 `data-xh-ink-surface` 的实心面上自动打开，`--xh-action-shadow-focus-visible` 的缺省值随之换成这道线。实心按钮聚焦时盒外那一圈伪元素环撤掉。强制色档系统去掉间隔线，只剩环。

**调整** 字段外壳静息改为白底：`--xh-bg-field` 由「淡底兑一半」改为引 `--xh-bg-surface`。聚焦时描边换成 `--xh-border-control-focus`，描边内侧再补一道 inset 线（`--xh-field-shadow-focus` 的缺省值），合起来一个环宽，与别的部件盒内的环同宽；校验失败的字段聚焦时聚焦态胜出；强制色档补一道同宽的 Highlight 环。盒里的 field-inset 钮按盒铺的底取阶梯：描边档缺省白底、走白底阶梯 100 → 200，只有淡底档没聚焦时走淡底阶梯；字段里的已选标签只在淡底档的盒里换白底。主题要回到淡底字段，改写 `--xh-bg-field`，并把字段盒上的 `--xh-action-host-bg-hover / -pressed` 改回淡底阶梯。Action Control 与字段外壳的过渡清单去掉 `box-shadow`，焦点环即时出现、即时撤下。
