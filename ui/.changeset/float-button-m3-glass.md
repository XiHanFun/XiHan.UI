---
"@xihan-ui/styles": minor
---

角落浮钮家族（FloatButton、BackTop）缺省触发器迁移到 M3 通透玻璃：同源消费 `material.glass` 的背景、边缘、高光、柔影、磨砂与实体焦点面；显式形态保持原有语义表面。

FloatButton 的压缩皮肤由 7894 增至 8537 字节，BackTop 由 4740 增至 5359 字节；增量来自 M3 顶光、backdrop、实体焦点面及辅助模式验证入口，已重录逐皮肤体积基线，不提高全局阈值。
