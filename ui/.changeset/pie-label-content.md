---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

PieChart 新增 `labelContent`：扇区标签写什么。内建 `name-share`（外侧缺省）、`share`（内侧缺省）、`name-value`、`name`、`value`，也可以给函数自己拼，拿到写好的数值与占比；返回空串的扇区不写标签、外侧不画引导线。Web Components 内建写法另有 `label-content` 属性。新增类型 `PieLabelContent`、`PieLabelDetails`。
