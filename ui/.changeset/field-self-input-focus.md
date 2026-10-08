---
'@xihan-ui/styles': patch
---

字段聚焦态补齐两处：

- 字段外壳就是输入框本身的几处（Field 里作者的原生控件、Mention 输入框、Pagination 跳页框、PinInput 的格子）不再画全局聚焦环，与 TextField 一样只换承载面 + 聚焦描边；强制色档补一圈 Highlight 环。PinInput 当前格同样改为承载面 + 聚焦描边，不再另画环
- 指针停在聚焦着的字段上时聚焦面不再让位给悬停面（字段外壳配方的悬停档排除 `:focus-within`）
