---
'@xihan-ui/styles': minor
---

Popconfirm 内容面与 Popover 逐值共用 M2 Frosted Surface：背景 tint、顶部高光、边界、浮层投影、
不透明文字和 backdrop blur 保持同源，箭头沿用同一底色与边界且不重复采样。新增
`--xh-popconfirm-backdrop` 覆写口；减少透明与高对比由材质令牌原位切换，forced-colors 明确撤掉
装饰背景图。

标题与说明补齐窄宽断行和 M2 前景层级。确认、取消两颗内部操作改用 Button 同源的 soft 接触面、
顶光、边界、投影和状态过渡；确认仍为实心主操作，pending 时封住 hover / active 换面并保留
原位 spinner。新增 `--xh-popconfirm-action-shadow`、`--xh-popconfirm-cancel-bg-focus` 与
`--xh-popconfirm-cancel-fg-focus` 覆写口；两颗按钮聚焦时都使用明确的不透明隔离底。粗指针下命中区
沿块轴扩到 44px，不改变按钮视觉盒或操作区排布。

去注释压空白的皮肤体积从 8109 增至 10806 字节；增加M2表面、M1操作和聚焦隔离/辅助显示，仅更新本组件基线并保留10%容差。
