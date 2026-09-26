---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

FieldArray 的行增删与移动有进退场：首次渲染时已有的行直接呈现，新增的行以 `xh-item-in` 进场，删掉的行由替身在原处以 `xh-fade-out` 淡出（替身里的控件摘掉 id 与表单名，不进表单提交），上移、下移与增删带来的换位沿 `translate` 过渡滑到新位置。行照常按 `items` 渲染、删掉即卸载，写法不变。root 部件在列表动效接上之前投影 `data-instant`，并改为定位元素。
