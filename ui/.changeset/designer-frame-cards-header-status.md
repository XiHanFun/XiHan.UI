---
'@xihan-ui/designer-shell': minor
---

外框 `<xh-designer-frame>` 统一四款设计器的版式：

- 新增两个位置与缺省区：顶栏 `header`（插槽 `header-start` / `header-center` / `header-end`）与状态栏 `status`（`status-start` / `status-end`），各段有内容才显示。
- 左右与下方的区给了 `title` 就画成卡片：面板头写标题与副标题，右边是操作区（`slot="<区名>-actions"`）、帮助钮（给了 `help` 时，用 `<xh-tooltip>` 弹出说明）与关闭钮（`closable` 缺省为 true）。点关闭隐藏这块面板并派发 `layout-change`。
- 画布区四角与右侧中间加浮动条的落点：`canvas-top-start`、`canvas-top-end`、`canvas-bottom-start`、`canvas-bottom-end`、`canvas-end`。
- 尺寸槽 `--xh-designer-frame-start-min` / `-end-min` / `-bottom-min` 给出左右与下方拖动的像素下限（缺省取 `--xh-layout-col-min-*`），外框按当前宽高折成百分比；另有间距、面板头内边距与状态栏高度的尺寸槽。左右与下方的面板在分隔条上按 Enter 收起与展开。
- 物料、属性、问题三个零件新增 `headless`：放进卡片时不画自己的标题，由面板头显示。
- 外框文案新增 `closePanel`、`panelHelp`，十种语言都有。
