---
'@xihan-ui/styles': major
---

**调整** Alert 加一道语气淡边：根面的边由透明改为 `--xh-_tone-border`（语气 40% 混承载面，缺省 info 语气），淡底与页面之间有看得见的界，彩色落在边、底与图标上，标题与正文仍是正文色。`banner` 通栏只留朝内容那一侧（block-end）的这道边，贴边的三条仍不画。要回到无边，写 `--xh-alert-border: transparent`。
