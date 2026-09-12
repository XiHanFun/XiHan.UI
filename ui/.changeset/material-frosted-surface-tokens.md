---
"@xihan-ui/tokens": minor
---

**新增 M2 Frosted Surface 材质令牌，以及材质共用的 alpha 与 blur 阶梯。**

新增 `--xh-material-frosted-*` 九支完整配方：半透明 tint、固定 backdrop、边界、顶部高光、两段浮层投影、分隔线、不透明正文、不透明次要正文和焦点隔离面。浅色与深色分别定值；默认 tint 使用 `--xh-alpha-high`，backdrop 固定为 `blur(--xh-blur-md) + saturate(108%)`。滤镜不参与动效，也不通过 `will-change` 常驻合成层。

新增五档 `--xh-alpha-*` 与七档 `--xh-blur-*` 原语，供 M2～M4 材质配方统一消费。组件不得直接挑 alpha 或 blur 档；锚定浮层、导航等实际表面只读取材质令牌，页面根、表单、表格和长正文不会因此启用背景采样。

系统要求减少透明时，M2 在原作用域换成实体 surface 并关闭 backdrop；`forced-colors` 使用 `Canvas` / `CanvasText` 且关闭滤镜、投影；打印时同样实体化并取消高光与投影。三条路径保持原尺寸、层级和交互语义，不建立第二套组件结构。

正文、次要正文与焦点隔离面均保持不透明，并按纯黑、纯白、中灰、页面底和品牌色等最不利背景合成后验证对比度。具体组件仍需真正绘制 `focus-surface`，只声明令牌不算完成焦点合同。
