---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tree 新增 `size` 轴（`sm` / `md` / `lg`，缺省 `md`），三端同名：root 投影 `data-size`，叶子行与分支行按同一档投影 `data-xh-collection-size`（此前固定 `md`）。走集合家族的尺寸档：行的块向内衬取 `--xh-list-option-py-*`、行内内衬 / 间距 / 字号取 `--xh-control-px-*` / `-gap-*` / `-font-*`、展开箭头与对号盒及拖拽把手取 `--xh-control-indicator-*`、层级缩进 sm / md / lg 为 `--xh-space-3` / `-4` / `-5`，行外字形随图标档。md 与此前逐项一致；行字号的缺省由 `--xh-text-body-size` 改为同值的 `--xh-control-font-md`。
