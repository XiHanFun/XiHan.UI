---
'@xihan-ui/headless': patch
'@xihan-ui/styles': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Separator 的 decorative 模式现在同时输出 `role="none"` 与 `aria-hidden="true"`，确保带可见文案的纯装饰分隔整段退出无障碍树；语义分隔继续使用 `role="separator"`，垂直时才显式输出 `aria-orientation="vertical"`。

默认线色改用会随浅深主题、对比度与透明度策略变化的 frosted material separator，subtle 档使用 soft material separator，strong 档保留高对比边界。根线与文字两侧端线增加统一的胶囊端点，让 1px 横竖线在实体和玻璃表面都保持细腻边缘。
