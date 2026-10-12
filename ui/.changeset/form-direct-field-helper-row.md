---
'@xihan-ui/styles': patch
---

字段不包 `XhFormFieldGroup`、直接放进 Form 时，辅助行同样算项距：带说明或预留了错误文案行的字段不再另留 20px 项距，与字段集的组内项距一致。此前只有包在 field-group 里的字段归零，直接放进表单的字段辅助行 20px 与项距 20px 叠成两段。
