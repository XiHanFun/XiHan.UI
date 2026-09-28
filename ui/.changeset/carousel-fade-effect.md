---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Carousel 新增 `effect` 换页方式：缺省 `slide` 轨道平移；`fade` 时各张叠放在同一格，新一张淡入、旧一张同时淡出，时长与平移同一档，减弱动效下直接换。`loop` 回绕在 fade 下只是一次淡变；拖拽仍按方向与速度翻页、画面不跟手。fade 一页只放一张，`slidesPerPage` 大于 1 时报错。Web Components 用 `effect` 属性。
