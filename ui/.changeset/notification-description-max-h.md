---
'@xihan-ui/styles': minor
---

Notification 的正文（`item-description`）有了上限：缺省取中档滚动面高 `--xh-viewport-h-md`（16rem），长文在正文里竖滚、滚到头不带动页面，标题与操作钮留在卡片上；新增覆盖槽 `--xh-notification-description-max-h` 调这条上限。此前推一段长文（公告全文）会把卡片撑到整屏高，而整摞是不吃指针、不裁切的视口定位面，撑出视口的部分既看不到也滚不到。
