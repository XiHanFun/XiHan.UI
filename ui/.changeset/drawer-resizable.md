---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Drawer 新增 `resizable`：新增 `resize-trigger` 部件（`XhDrawerResizeTrigger`，role=separator），落在朝向页面的那条边上，拖动它或聚焦后用方向键推面板厚度（Shift 大步、Home / End 推到上下限），推向页面那一侧变厚，从右往左排版时把手与方向一起翻。厚度夹在 `minPanelSize`（缺省 160）与 `maxPanelSize` 之间且不超出视口或所在容器；`panelSize` / `defaultPanelSize` / `onPanelSizeChange`（Vue 另有 `v-model:panel-size`，Web Components 派发 `panel-size-change`）走受控与非受控，没调过时按 `size` 档绘制。拖动复用对话框机器里的指针会话，步长与 Resizable 同一档；调过的厚度写进 content 的私有槽，压过 size 档。`DrawerTranslations` 新增 `resizeTrigger`，`DrawerApi` 新增 `panelSize` 与 `resizing`。
