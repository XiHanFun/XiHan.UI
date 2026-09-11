---
'@xihan-ui/styles': minor
---

Switch 保持实体表单控件，不引入 backdrop 或玻璃轨道。未选中轨道新增不占几何的内边界，选中轨道使用
实心语气底与配对前景，只读选中态使用中性底和控制边界；暗色下不再依赖浏览器默认 button 前景来决定
聚焦环。disabled、readonly 与 loading 的根和标签光标分开，loading 不再触发可操作的按压反馈。

滑块迁入 M1 Soft Surface：实体背景、细边、顶部高光与接触影同源，悬停升到 raised，按住时撤掉高光和
投影并沿行进轴轻微拉长，释放后回圆；checked 端同步补偿位移，外缘不会越出轨道。RTL 的物理位移反转，
三尺寸和 compact 密度继续由现有轨道高度推导。减弱动效取消拉伸并保留静止 loading 点线，forced-colors
用轨道 outline 与滑块真实边框保住双层几何。

新增轨道覆盖槽 `--xh-switch-border`、`--xh-switch-border-checked`、`--xh-switch-border-checked-readonly`、
`--xh-switch-fg`、`--xh-switch-fg-checked`、`--xh-switch-fg-checked-readonly`；
新增滑块覆盖槽 `--xh-switch-thumb-border`、`--xh-switch-thumb-highlight`、`--xh-switch-thumb-fg`、
`--xh-switch-thumb-shadow-hover`、`--xh-switch-thumb-shadow-pressed`、`--xh-switch-thumb-shadow-disabled` 与
`--xh-switch-thumb-press-stretch`。既有覆盖槽未删除，因此 Styles 按 minor 记录。

去注释与空白后的皮肤体积由 5465 增至 9603 字节；增量来自实体轨道边界、M1 滑块表面、四类交互守卫、
RTL/减弱动效以及 forced-colors 的明确双层几何。

皮肤体积（去注释、压空白）：前一提交源码 5465 字节，当前 9603 字节；登记基线 5465 → 9603，只更新本组件，10% 容差保持不变。
