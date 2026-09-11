---
"@xihan-ui/styles": minor
---

**Tooltip 迁入高遮蔽的紧凑反白 M2 表面。**

默认反白与 `tone` 语义继续保留：Tooltip 是一句非交互说明，应与普通主题色的 Popover 操作面明确区分。surface 现在把 `_tone` 或默认前景色以 94% 高遮蔽 tint 合成，正文仍使用完全不透明的 `_tone-on` 或主题表面色。94% 是六种 tone 在纯黑、纯白、灰色和品牌色最坏底色上都达到 4.5:1 的首个安全整档；88% 与 92% 分别仍有最低 4.18 和 4.42 的失败组合。

紧凑光学层只消费 `--xh-material-frosted-compact-alpha/backdrop/shadow`，组件不直接挑 alpha、blur 或投影原语；6px control radius 保持小表面比例。新增 `--xh-tooltip-border`、`--xh-tooltip-highlight` 与 `--xh-tooltip-backdrop` 覆写口。箭头读取与内容相同的 surface 和 border，不重复执行 backdrop blur。高对比与减少透明模式由 compact 配方原位切成同色实体并关闭 blur，高对比同时撤掉装饰顶光，forced-colors 使用 Canvas/CanvasText，打印继续隐藏整个定位层。

进退场移除 zoom，改为共享 `xh-overlay-slide-in/out` 的 opacity + placement translate；positioner 先清零四个方向变量再启用实际一侧，阻断嵌套浮层继承。进出都使用现有 fast 120ms 时长，`will-change` 只登记 opacity 与 translate。共享 motion distance 当前最小为 4px；规格建议的 2px 留待公共 distance-xs 原语独立提交后统一接入，本次不局部覆盖全局语义令牌。

长单句在共享最大宽度内使用 pretty wrapping，连续长词可断行。Tooltip 仍不承载按钮、链接或关闭控件；TooltipProvider、skip-delay、同组互斥与触发器滚动关闭没有在本次视觉提交中伪造。

皮肤体积（去注释、压空白）从 3873 增至 5673 字节；增量为材质、稳定列布局与状态反馈，仅登记本组件，10% 容差保持不变。
