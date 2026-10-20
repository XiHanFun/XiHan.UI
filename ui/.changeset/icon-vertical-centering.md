---
'@xihan-ui/styles': patch
---

**修复** 菜单、右键菜单、菜单栏的 `item-icon`，以及 Listbox、Select、Combobox、Command、Mention 的 `item-prefix`：格里的图标与正文上下居中，中线对齐。菜单族的图标格宽高都取图标尺寸，盒高不再靠行高撑；候选列表的行首格里面居中。图标比行高矮时（如 `sm` 档 16px 的图标配 19.5px 的行高）不再贴着格子上沿、比正文高出约 2px。Web Components 的 `<xh-icon>` 宿主改为只包住 `<svg>` 的行内块（行高归 0），盒子与图标一样大，不再按行高撑出一截、把图标顶到上沿，放进弹性或网格容器时与 Vue / React 一样居中；行内文字里的位置不变。给宿主写了 `display` 时以作者为准。只改皮肤。
