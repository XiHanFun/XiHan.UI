---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

NavigationMenu 换张瞬时：在两张之间换时两侧 content 都投影 `data-instant`、不播进退场，与 Menubar 一致；用共享外壳（viewport）时不再新旧两张上下叠放、外壳先变高再塌回。外壳自己承担首开弹出与末收收回（投影 `data-state` / `data-instant`），外壳里的面板只随之淡入淡出。
