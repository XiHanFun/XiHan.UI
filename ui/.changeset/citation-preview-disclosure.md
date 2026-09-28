---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Citation 预览按 surface 级披露展开收起：内容区高度从 0 长到整块（`--xh-motion-duration-expand` + `enter-strong`）、收起时收回 0（`collapse` + `exit`），内缩、描边与它前面那道间距一起动，后面的段落随之平移（此前瞬开瞬关、直接推开后面的段落）。首帧就开着的预览投影 `data-instant` 直接呈现；减弱动效下瞬时完成。

- 收起的那一份先播完收回才写 `hidden`，途中带 `inert`；换来源时旧的收起、新的展开同时进行。
- 机器新增 context `shownSourceId` / `leavingSourceId` / `moved` / `previewBlockSizes` 与事件 `PREVIEW.MEASURED` / `PREVIEW.LEFT`；预览露面与收起前量下内容区高度，连接层写进内联私有槽。
- 皮肤新增关键帧 `xh-citation-preview-expand` / `xh-citation-preview-collapse`（登记为布局动画例外）；根改为纵向 flex 排列，预览的盒模型改为 content-box 并裁掉溢出。皮肤体积基线随之上调。
