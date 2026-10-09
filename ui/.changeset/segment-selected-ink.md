---
'@xihan-ui/tokens': patch
---

墨色域里的分段选中面改按墨色比例取值：`--xh-bg-segment-selected` / `-hover` / `-disabled` 黑墨取 12% / 18% / 8%、白墨取 20% / 28% / 8%（与浅色 / 深色主题同口径），`--xh-fg-segment-selected-disabled` 取墨色 50%。此前 auto 域与库自有彩色面里这几支沿用外层主题求好的品牌淡底，深色彩色面上选中段是白字压浅品牌色底。
