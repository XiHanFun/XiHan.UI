---
"@xihan-ui/styles": minor
---

**Button 使用 M1 细化表面、压感、载入布局与实心焦点反馈。**

默认与 `subtle` 从单一淡底升级为实体 M1 控制面：细边、单像素顶光与极弱 contact shadow 同源；`solid` 保留高遮蔽语气色并叠加接触影，不使用磨砂或背景模糊。`outline`、`ghost` 仍是透空形态。悬停升到 raised，按下时撤掉外影并使用既有 0.98 压感，按住状态不会继续保留 hover 投影。

`loading` 不再与 `disabled` 共用整根 0.5 opacity。按钮保留完整表面、文字和焦点，只停止 hover/pressed 并使用 progress 光标；现有 `indicator` 统一为当前图标档大小，只在 loading 时显示、旋转。皮肤不生成缺失的 spinner：作者要稳定宽度，应让带真实图形的 indicator 常驻，非载入态由 `visibility` 隐藏。

label、prefix、suffix、indicator 统一使用居中的 inline-flex 行盒，直接 SVG 与指示器按当前图标档对齐。实心按钮保留与表面对比明确的内环，并新增独立品牌外环；forced-colors 下外环使用系统 `Highlight`，减少动效与打印时 spinner 停转。

ButtonGroup 中未自行声明 variant 的段继续由组控制高光且不逐段画外影，接缝与尺寸不因 M1 改变。
