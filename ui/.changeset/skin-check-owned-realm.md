---
'@xihan-ui/core': major
---

`startSkinCheck({ root })` 现在从 root 所属 Window 取得 Element 品牌、计算样式与 MutationObserver，并支持顶层 DOM globals 缺失时检查显式外部 root。

显式 root 没有活动 Window 或 MutationObserver 时改为明确抛错，删除原先只扫描一次后静默停止持续检查的降级行为。
