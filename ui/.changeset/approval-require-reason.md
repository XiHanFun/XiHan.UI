---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Approval 新增 `requireReason`（Web Components 属性 `require-reason`）：用户拒绝时必须写明理由。备注空着（或只有空白）就按拒绝钮或 Escape，不发判定，焦点移到备注框，备注框带 `aria-invalid` 与 `data-invalid`、描边换成无效色；写上理由再按即拒绝，理由随载荷的 `note` 发出。只拦人手按的这两条路：超时、卸载兜底与宿主的 `deny()` 照常落地，没渲染备注框时也照常拒绝。开启后备注框的名字取 `translations.reason`（新增，默认 `Reason for denial`）并带 `aria-required`。API 新增 `reasonMissing`；外观槽新增 `--xh-approval-note-border-invalid` 与 `--xh-approval-note-ring-invalid`（聚焦时焦点环也换成无效色）。
