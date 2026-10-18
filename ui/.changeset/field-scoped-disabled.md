---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Field 放进禁用的 Fieldset（或经全局配置给了 `disabled`）时一并禁用：根、标题与说明带上 `data-disabled`，与组内控件一起变淡。此前 Field 只从外层字段与表单继承禁用，字段集禁用时组内控件变淡，字段的标题与说明照旧。Fieldset 的 legend 里的字段仍不受连坐。
