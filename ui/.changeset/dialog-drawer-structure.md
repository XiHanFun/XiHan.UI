---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 对话框与抽屉的 props 写法：不写子内容时按标准结构（`dialogStructure` / `drawerStructure`，两者同一份面板结构）铺出触发器、页头（标题与说明）、正文、页脚与关闭钮，一个组件加三个 prop 就是一个确认对话框：

- Vue：`trigger-text`、`title`、`description`，正文与整段页脚走 `body` / `footer` 插槽，`trigger` / `title` / `description` 插槽压过同名文字；
- React：`trigger`、`title`、`description`、`body`、`footer` 五个 ReactNode 属性；`XhDrawerRoot` 的 `title` 因此不再作为原生 title 属性写到根上；
- Web Components：`trigger-text`、`title-text`、`description` 三个属性，`slot="body"` / `slot="footer"` 等宿主直接子节点搬进对应部件。

页脚按 `actions` 铺取消与确定两颗钮（`alert` 只有确定，`none` 不铺），`confirmText` / `cancelText` 改字，缺省取语言包；抽屉的语言包补上 `ok` / `cancel`。

两个组件的 anatomy 各新增 `confirm-trigger` 与 `cancel-trigger` 两个部件（Vue / React 的 `XhDialogConfirmTrigger`、`XhDialogCancelTrigger`、`XhDrawerConfirmTrigger`、`XhDrawerCancelTrigger`），与气泡确认同一套确认门：确定发 `confirm`，`onConfirm` 返回 thenable 时等它兑现才收起、确定钮转圈，期间 Escape 与点外面关不掉，拒绝留在原地并发 `confirm-error`（Web Components 交给 `confirmAction` 属性）；取消发 `cancel-press` 并收起；关闭钮随时收得起，挂起中的确认随之作废。connect 新增第三个参数接这两颗钮的意图与 pending / actionError 两个状态通道，API 新增 `pending`、`actionError`、`confirm`、`cancel`。确认门从气泡确认里抽成共享模块，气泡确认的行为不变。组合写法照旧。
