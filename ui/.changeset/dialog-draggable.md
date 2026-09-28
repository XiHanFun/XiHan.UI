---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Dialog 新增 `draggable`（Web Components 为 `panel-draggable`，避开 HTML 全局的 `draggable`）：指针按住标题栏（header，没写 header 时是 title）即跟手挪走面板，标题栏里的按钮与表单控件照常点，面板四边始终夹在视口内，每次打开从居中落点起。新增 `drag-trigger` 部件（`XhDialogDragTrigger`）：放在 header 里铺满标题栏的透明把手，方向键挪一步、Shift 大步、Enter / Space 回到居中，初始焦点越过它。拖动走 `@xihan-ui/pointer` 的指针会话，位移写成 content 上的私有槽、按 transform 平移，与进出场关键帧叠加，拖过的面板从拖到的位置退场。`DialogTranslations` 新增 `dragTrigger`，`DialogApi` 新增 `offset` 与 `dragging`。
