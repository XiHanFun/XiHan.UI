---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

虚拟滚动（Virtualizer）的 `scrollContainer` 新增 `ancestor`：滚视口最近的、在主轴上可滚动的祖先，找不到时随整页滚。视口与根写 `data-scroll-container="ancestor"`，视口不滚动、不占 Tab 位，列表在祖先里的起点每次滚动现量。`collectionVirtualizer` 多报一个 `scrollContainer`。

表格（Table）的虚拟滚动改用这一写法：Virtualizer 写 `scrollContainer="ancestor"`，表格根节点保留皮肤给的限高与滚动，表体里的视口不定高。

- 吸顶表头、冻结列、横向溢出与行在同一个滚动面里：列宽之和超过容器时表头与行同列对齐，冻结列在表头与表体都留在行首。
- 视口不再带 tabindex，表体的 rowgroup 直接拥有行，axe 不再报 aria-required-children。
- 表格行不窄于自己那排格子（`min-inline-size: max-content`），装在虚拟条目里时照样和表头一样宽；Virtualizer 的根在 window 与 ancestor 形态下不再裁切，列表里吸附的格子钉得住。
- 表体里的视口自己滚时，开发模式下提醒一次。原来的写法仍可用于普通长列表。
