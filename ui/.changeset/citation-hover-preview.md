---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Citation 新增悬停预览与一处多源轮换：

- 新增 `previewMode`（`inline` 缺省 / `hover`）。hover 档把预览放进新部件 `positioner`（Vue / React `XhCitationPositioner`，Web Components `data-xh-part="positioner"`），锚定在引用编号旁的悬停卡片接定位引擎、搬到 portal 落点、不推动正文；指针停留 `openDelay`（缺省 700ms）出现，离开编号与卡片 `closeDelay`（缺省 300ms）后收起，卡片开着或刚收起不到 `skipDelayDuration`（缺省 300ms）时指向另一处引用直接接替；焦点落到引用上当场打开，Escape 与卡片外按下收起；触屏交给点按。卡片是 frosted 锚定面板，出现与退场走 `xh-overlay-pop-in` / `xh-pop-out`。另新增 `placement`、`offset`。
- 行内引用新增 `sourceIds`（Web Components 在 `value` 里写空白分隔的几个 id），与 `sourceId` 只写一个；预览新增部件 `prev-trigger`、`next-trigger`、`preview-index`，在一处多源的几个来源之间轮换，只有一个来源时收起。新增文案 `citations`、`previousSource`、`nextSource`。
- 新增导出 `CITATION_DEFAULT_PLACEMENT` 与类型 `CitationPreviewMode`、`CitationRefs`、`CitationTriggerTarget`；API 新增 `activeGroup`、`previewMode`、`getPositionerProps`、`getPrevTriggerProps`、`getNextTriggerProps`、`getPreviewIndexProps`、`getPreviewPosition`。
- 行内引用的 `aria-expanded` 只落在打开预览的那一处（从来源列表打开时同来源的引用都算）。
- 修正 Vue `XhCitationRoot` 只在首帧读取 props：受控写回与改档此前传不进机器。
