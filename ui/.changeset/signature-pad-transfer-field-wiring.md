---
'@xihan-ui/web-components': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

签名板与穿梭框直接放进表单字段时接上字段：签名板的画布（`control`，`role="img"`）名字取字段标题，穿梭框两侧列表（`list`，`role="listbox"`）的名字前面并上字段标题、后面仍是面板标题，说明与错误文案进描述链；点字段标题，签名板把焦点交给第一颗可聚焦的按钮，穿梭框交给源侧列表。此前放进字段时读屏念不到字段标题与提示，点标题也没有反应。
