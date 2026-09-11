---
"@xihan-ui/tokens": minor
---

**增加 M2 Frosted Surface 的 compact 光学尺度，供 Tooltip 等高遮蔽小浮层使用。**

新增 `alpha.ultra-high = 0.94` 原语，以及 `material.frosted.compact-alpha`、`material.frosted.compact-backdrop`、`material.frosted.compact-shadow` 三支公共配方。内置六种 tone 与默认反白面在纯黑、纯白、灰色、页面底和品牌色底上验证，0.94 均达到 4.5:1 正文对比；0.88 与 0.92 仍存在失败组合。

compact backdrop 使用 8px blur 与 104% saturation；compact shadow 在亮暗主题分别定义两层小浮层投影，最大范围由标准 M2 的 28px 收到 16px。高对比、forced-colors 与打印把 alpha/backdrop/shadow 切到 opaque/none/none；减少透明把 alpha/backdrop 切到 opaque/none，并保留主题对应的小浮层投影。

本配方只补紧凑表面的 alpha、backdrop 与 shadow，不复制现有 M2 的背景、边界、前景、高光、分隔和焦点表面。组件仍须从完整 M2 配方组合其余语义，不能直接读取 blur 原语。
