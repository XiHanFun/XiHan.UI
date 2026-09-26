---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

TagsInput 的标签增删有进退场：首次渲染时已有的标签直接呈现，新落下的标签以 `xh-item-in` 进场、同一批按到达顺序错开，删掉的标签由替身在原处以 `xh-fade-out` 淡出，其余标签沿 `translate` 过渡滑到新位置。标签照常按值渲染、删掉即卸载，写法不变。control 部件在列表动效接上之前投影 `data-instant`，并改为定位元素（退场替身的定位基准）。
