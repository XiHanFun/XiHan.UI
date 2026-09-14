---
'@xihan-ui/styles': major
'@xihan-ui/tokens': minor
---

Editable 改为与 NumberField 一致的一体式字段结构：标签在上，`control` 是唯一的边框、背景、圆角、落影与焦点环载体，预览文字或输入框与动作组都位于框内。预览态只显示编辑图标，编辑态只显示确认与取消图标；空按钮由共享皮肤使用 Pencil、Check、Close 字形绘制，作者仍需提供可访问名称。

Breaking：字段表面覆盖槽从 `--xh-editable-input-*` 迁移为 `--xh-editable-control-*`；独立按钮边框、圆角和实心提交按钮相关槽已移除，动作尺寸与分隔线改用 `--xh-editable-trigger-size`、`--xh-editable-trigger-divider` 和 `--xh-editable-trigger-divider-h`。

新增一体式字段排布、三颗图标动作、粗指针命中区与状态样式后，`editable.css` 的去注释压空白体积由 10,386 字节增至 13,335 字节。
