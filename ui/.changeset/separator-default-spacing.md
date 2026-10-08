---
'@xihan-ui/styles': major
---

Separator 缺省线色改为 border-default（subtle / strong 两档不变）；自带留白：横线上下各 20px、竖线左右各 12px（新增覆盖槽 `--xh-separator-my`、`--xh-separator-mx`），竖线最少与文字等高；带分节文字时上下留白收到 10px，文字改 14px / 500 / 正文色（新增 `--xh-separator-content-font-weight`），与两条线各隔 16px。补强制色规则：线改写 CanvasText，实线与虚线都不再消失。
