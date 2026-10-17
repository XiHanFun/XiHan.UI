---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

列表框的标准结构铺出空态与在途占位：列表之后依次是 `empty`、`loading`，文字取新增的 `translations.empty`、`translations.loading`（十种语言包同步补上，与选择器同一套说法），按状态收放。`ListboxApi` 新增 `translations`；三端新增 `translations`，Vue 加 `empty` 插槽、React 加 `empty` 属性、Web Components 可用 `slot="empty"` 接管空态。Vue / React 的列表框改为经全局配置取文案与尺寸，与 Web Components 一致。
