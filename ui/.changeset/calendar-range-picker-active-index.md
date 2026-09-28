---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CalendarRangePicker 新增 `activeIndex`（`0 | 1`，缺省 0）：为 1 且已有起点时只改终点——起点当锚，点在起点那一天或之后即落终点、起点原样留着；点在起点之前的日子从那一天重新开始挑（它成为新的起点，再点一下落终点）。悬停在起点之后时预览「起点 → 悬停」，焦点格提示这一下是收尾；这一档不进挑到一半的状态，焦点离开网格也不就地收口。Web Components 的 attribute 是 `active-index`。
