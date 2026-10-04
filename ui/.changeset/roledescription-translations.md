---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

四处写死英文的读屏角色说明（`aria-roledescription`）改为可经 `translations` 翻译，缺省仍是原来的英文：

- Carousel：`rootRoleDescription`（根，缺省 `carousel`）、`itemRoleDescription`（每一张，缺省 `slide`）。
- Sortable：`itemDragTriggerRoleDescription`（拖拽手柄，缺省 `sortable`）。
- Table：`columnDragRoleDescription`（列拖拽把手，缺省 `draggable column`）。

内建语言包同步补齐这四个键，切换语言后读屏不再夹着英文的角色名。
