---
"@xihan-ui/styles": patch
---

修复独立 Toast 被误判为折叠堆叠后台层、导致状态图标和文案全部透明的问题。折叠裁切现在只作用于已经登记 `data-stack-index` 的堆叠条目，单独渲染与文档示例保持完整可见。
